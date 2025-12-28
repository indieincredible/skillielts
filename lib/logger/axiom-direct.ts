/**
 * Direct Axiom logging module without pino-axiom dependency
 * Provides batching, retry, and priority control for logs sent directly to Axiom API
 */
import { LogLevel, LogData, Logger, formatError, shouldLogToConsole } from './logger-core';

// Queues for batching logs by priority
interface LogQueues {
  high: LogData[];
  normal: LogData[];
  low: LogData[];
}

const logQueues: LogQueues = {
  high: [], // For errors and fatal logs - sent immediately
  normal: [], // For info and warnings - normal batching
  low: [], // For debug - lowest priority
};

// Status tracking
let isSendingLogs = false;
let failedAttempts = 0;

// Configuration from environment variables or use default values
const BATCH_SIZE = parseInt(process.env.AXIOM_BATCH_SIZE || '10', 10); // Default: 10 logs
const FLUSH_INTERVAL = parseInt(process.env.AXIOM_FLUSH_INTERVAL || '5000', 10); // Default: 5 seconds
const MAX_RETRIES = parseInt(process.env.AXIOM_MAX_RETRIES || '3', 10); // Default: 3 retry attempts
const RETRY_DELAY = parseInt(process.env.AXIOM_RETRY_DELAY || '2000', 10); // Default: 2 seconds

/**
 * Add a log entry to the appropriate queue
 */
export function queueLog(logData: LogData): void {
  // Determine priority based on log level
  let priority: keyof LogQueues;
  switch (logData.level) {
    case 'fatal':
    case 'error':
      priority = 'high';
      break;
    case 'warn':
    case 'info':
      priority = 'normal';
      break;
    default:
      priority = 'low';
  }

  // Add to appropriate queue
  logQueues[priority].push(logData);

  // Send immediately for high priority or if batch size reached
  if (priority === 'high' || logQueues.normal.length >= BATCH_SIZE) {
    void sendLogsToAxiom();
  }
}

/**
 * Send logs to Axiom with retry capability
 */
export async function sendLogsToAxiom(): Promise<void> {
  // Don't proceed if already sending or if all queues are empty
  if (
    isSendingLogs ||
    (logQueues.high.length === 0 && logQueues.normal.length === 0 && logQueues.low.length === 0)
  ) {
    return;
  }

  try {
    isSendingLogs = true;

    // Collect logs from queues in priority order
    const logsToSend = [
      ...logQueues.high, // Send high priority first
      ...logQueues.normal,
      ...logQueues.low,
    ];

    // Clear queues
    logQueues.high = [];
    logQueues.normal = [];
    logQueues.low = [];

    // Skip if Axiom credentials are not available
    if (!process.env.AXIOM_TOKEN || !process.env.AXIOM_DATASET) {
      return;
    }

    // Send logs to Axiom
    const response = await fetch(
      `https://api.axiom.co/v1/datasets/${process.env.AXIOM_DATASET}/ingest`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logsToSend),
      }
    );

    if (!response.ok) {
      throw new Error(`Axiom API error: ${response.status} ${response.statusText}`);
    }

    // Process response
    const result = await response.json();
    // Log infrastructure message using console to avoid recursion
    if (shouldLogToConsole) {
      console.log('[Axiom Direct] Sent logs successfully', {
        count: logsToSend.length,
        result,
      });
    }

    // Reset failed attempts on success
    failedAttempts = 0;
  } catch (error) {
    failedAttempts++;
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (shouldLogToConsole) {
      console.error(
        `[Axiom Direct] Error sending logs (attempt ${failedAttempts}/${MAX_RETRIES}):`,
        errorMsg
      );
    }

    // Put logs back in queue if we haven't exceeded retry limit
    if (failedAttempts < MAX_RETRIES) {
      // Implement exponential backoff for retry
      const backoffTime = RETRY_DELAY * Math.pow(2, failedAttempts - 1);
      // Log infrastructure message using console to avoid recursion
      if (shouldLogToConsole) {
        console.log(`[Axiom Direct] Retrying in ${backoffTime}ms...`);
      }

      // Retry after delay
      setTimeout(() => {
        isSendingLogs = false;
        void sendLogsToAxiom();
      }, backoffTime);
      return; // Exit early to prevent retry loop
    }
  } finally {
    if (failedAttempts >= MAX_RETRIES) {
      if (shouldLogToConsole) {
        console.error(`[Axiom Direct] Failed to send logs after ${MAX_RETRIES} attempts.`);
      }
      failedAttempts = 0; // Reset for next batch
    }

    isSendingLogs = false;

    // If more logs accumulated while sending, send those too
    if (logQueues.high.length > 0 || logQueues.normal.length > 0 || logQueues.low.length > 0) {
      void sendLogsToAxiom();
    }
  }
}

/**
 * Log an event with specific level
 */
export function logEvent(level: LogLevel, message: string, data?: Record<string, any>): void {
  queueLog({
    level,
    message,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

// Convenience methods for different log levels
export const logInfo = (message: string, data?: Record<string, any>): void =>
  logEvent('info', message, data);

export const logError = (message: string, error?: Error, data?: Record<string, any>): void =>
  logEvent('error', message, {
    ...data,
    error: formatError(error),
  });

export const logWarn = (message: string, data?: Record<string, any>): void =>
  logEvent('warn', message, data);

export const logDebug = (message: string, data?: Record<string, any>): void =>
  logEvent('debug', message, data);

export const logFatal = (message: string, error?: Error, data?: Record<string, any>): void =>
  logEvent('fatal', message, {
    ...data,
    error: formatError(error),
  });

/**
 * Create a DirectLogger object implementing the Logger interface
 */
export function createDirectLogger(context?: Record<string, any>): Logger {
  return {
    debug: (message, data) => logDebug(message, { ...context, ...data }),
    info: (message, data) => logInfo(message, { ...context, ...data }),
    warn: (message, data) => logWarn(message, { ...context, ...data }),
    error: (message, error, data) => logError(message, error, { ...context, ...data }),
    fatal: (message, error, data) => logFatal(message, error, { ...context, ...data }),
    child: childContext => createDirectLogger({ ...context, ...childContext }),
  };
}

/**
 * Verify connection to Axiom
 */
export async function testDirectAxiomConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    // Send a test log directly
    logEvent('info', 'Test log via direct Axiom API', {
      test: true,
      time: new Date().toISOString(),
    });

    // Force send immediately
    await sendLogsToAxiom();
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (shouldLogToConsole) {
      console.error('Test direct Axiom connection failed:', errorMsg);
    }
    return { success: false, error: errorMsg };
  }
}

// Flag to track whether flush has been scheduled
let flushScheduled = false;

/**
 * Schedule sending logs without blocking the current thread
 * Uses debounce pattern to avoid flushing too many times
 */
export function scheduleFlush(): void {
  // If already scheduled, do nothing
  if (flushScheduled) return;

  // Mark as scheduled
  flushScheduled = true;

  // Execute flush immediately after the current event loop completes
  Promise.resolve()
    .then(() => {
      flushScheduled = false;
      void sendLogsToAxiom();
    })
    .catch(err => {
      if (shouldLogToConsole) {
        console.error('[Axiom Direct] Error during scheduled flush:', err);
      }
      flushScheduled = false; // Reset state if there's an error
    });
}

// Set up interval to flush logs periodically if we're in a browser or Node environment
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (logQueues.high.length > 0 || logQueues.normal.length > 0 || logQueues.low.length > 0) {
      void sendLogsToAxiom();
    }
  }, FLUSH_INTERVAL);
}






