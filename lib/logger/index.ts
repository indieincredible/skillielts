import { createDirectLogger } from './axiom-direct';
import {
  isEdgeRuntime,
  isBrowser,
  isNode,
  isDev,
  isLogEnabled,
  useAxiom,
  shouldLogToConsole,
  LogLevel,
  Logger,
} from './logger-core';

/**
 * Create a console-based logger for environments where pino isn't suitable
 */
function createConsoleLogger(): Logger {
  // Helper to create log methods
  const createLogMethod = (level: LogLevel) => {
    return function (message: string, data?: Record<string, any>) {
      // Use CONSOLE_LOGGING_ENABLED flag to control console output
      if (!shouldLogToConsole) return;

      // Determine console method
      const consoleMethod = level === 'fatal' ? 'error' : level;

      // Format log output
      if (data) {
        const logFn = console[consoleMethod as keyof Console] as (..._args: any[]) => void;
        logFn(`[${level.toUpperCase()}] ${message}`, data);
      } else {
        const logFn = console[consoleMethod as keyof Console] as (..._args: any[]) => void;
        logFn(`[${level.toUpperCase()}] ${message}`);
      }
    };
  };

  // Create error-specific log methods
  const createErrorMethod = (level: 'error' | 'fatal') => {
    return function (message: string, error?: Error, data?: Record<string, any>) {
      // Use CONSOLE_LOGGING_ENABLED flag to control console output
      if (!shouldLogToConsole) return;

      const logData = { ...data };
      if (error) {
        logData.error = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
      }
      // Use error function directly to avoid TypeScript error
      const errorFn = console.error as (..._args: any[]) => void;
      errorFn(`[${level.toUpperCase()}] ${message}`, logData);
    };
  };

  // Return logger object that implements Logger interface
  return {
    debug: createLogMethod('debug'),
    info: createLogMethod('info'),
    warn: createLogMethod('warn'),
    error: createErrorMethod('error'),
    fatal: createErrorMethod('fatal'),

    // Create child logger with context
    child: function (context: Record<string, any>): Logger {
      const childLogger: Logger = {
        debug: (msg, data) => createLogMethod('debug')(msg, { ...context, ...data }),
        info: (msg, data) => createLogMethod('info')(msg, { ...context, ...data }),
        warn: (msg, data) => createLogMethod('warn')(msg, { ...context, ...data }),
        error: (msg, err, data) => createErrorMethod('error')(msg, err, { ...context, ...data }),
        fatal: (msg, err, data) => createErrorMethod('fatal')(msg, err, { ...context, ...data }),
        child: childContext => this.child({ ...context, ...childContext }),
      };

      return childLogger;
    },
  };
}

/**
 * Create and configure logger based on environment
 */
let logger: Logger;

// Simplify logger logic
if (isLogEnabled && useAxiom && process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
  // If Axiom is configured, use direct logger
  if (shouldLogToConsole) {
    console.log('[Logger] Using Axiom direct logger');
  }
  logger = createDirectLogger();
} else {
  // Otherwise, use console logger
  logger = createConsoleLogger();
}

/**
 * Test Axiom connection by sending a test log
 * @returns Test result
 */
async function testAxiomConnection(): Promise<Record<string, any>> {
  try {
    // Log a test message
    const testId = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();

    // Get logger configuration information
    const loggerInfo = {
      type: logger.constructor.name,
      runtime: isEdgeRuntime ? 'edge' : isNode ? 'node' : isBrowser ? 'browser' : 'unknown',
      hasAxiomToken: !!process.env.AXIOM_TOKEN,
      hasAxiomDataset: !!process.env.AXIOM_DATASET,
      logLevel: process.env.LOG_LEVEL || (isDev ? process.env.DEV_LOG_LEVEL : 'info'),
    };

    // Send log at error level to ensure immediate delivery
    error(`Test Axiom Connection [${testId}]`, undefined, {
      timestamp,
      loggerTest: true,
      loggerInfo,
    });

    // Test direct logger if available
    if (isEdgeRuntime || isBrowser) {
      try {
        // Force flush logs through axiom-direct
        const { sendLogsToAxiom } = await import('./axiom-direct');
        await sendLogsToAxiom();
      } catch (err) {
        console.error('[Axiom Test] Failed to flush direct logger queue', err);
      }
    }

    return {
      success: true,
      message: 'Test log sent to Axiom',
      testId,
      timestamp,
      loggerInfo,
    };
  } catch (err) {
    console.error('[Axiom Test] Error testing connection:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Helper functions that match our standard logging interface
 */

// Simple log levels

const debug = (message: string, data?: Record<string, any>) => {
  logger.debug(message, data);
};

const info = (message: string, data?: Record<string, any>) => {
  logger.info(message, data);
};

const warn = (message: string, data?: Record<string, any>) => {
  logger.warn(message, data);
};

// Error log levels with special error handling
const error = (message: string, err?: Error, data?: Record<string, any>) => {
  logger.error(message, err, data);
};

const fatal = (message: string, err?: Error, data?: Record<string, any>) => {
  logger.fatal(message, err, data);
};

/**
 * Create a child logger with context data
 */
const child = (context: Record<string, any>): Logger => {
  return logger.child(context);
};

/**
 * Create a factory function to create a unified logger
 */
export function createLogger(context?: Record<string, any>): Logger {
  if (context) {
    return logger.child(context);
  }
  return logger;
}

// Export logger and helper functions
export {
  logger,
  debug,
  info,
  warn,
  error,
  fatal,
  child,
  testAxiomConnection,
  // Re-export utilities
  isEdgeRuntime,
  isBrowser,
  isNode,
  isDev,
};

// Re-export types (using 'export type' for isolatedModules compatibility)
export type { LogLevel } from './logger-core';

// Export the logger as default
export default logger;






