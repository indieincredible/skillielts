/**
 * Logger core - contains core logic and interfaces for the logging system
 */

// Supported log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Interface for log data
export interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

// Interface for Logger
export interface Logger {
  debug(_message: string, _data?: Record<string, any>): void;
  info(_message: string, _data?: Record<string, any>): void;
  warn(_message: string, _data?: Record<string, any>): void;
  error(_message: string, _error?: Error, _data?: Record<string, any>): void;
  fatal(_message: string, _error?: Error, _data?: Record<string, any>): void;
  child(_context: Record<string, any>): Logger;
}

// Check environment
export const isEdgeRuntime =
  typeof process !== 'undefined' &&
  (process.env.NEXT_RUNTIME === 'edge' ||
    typeof process.argv.find(arg => arg.includes('edge-runtime')) !== 'undefined');

export const isBrowser = typeof window !== 'undefined';
export const isNode = !isEdgeRuntime && !isBrowser;

// Environment-based configuration
export const isDev = process.env.NODE_ENV !== 'production';
export const isLogEnabled = process.env.LOG_ENABLED !== 'false';
export const logLevel = isDev
  ? process.env.DEV_LOG_LEVEL || 'debug'
  : process.env.LOG_LEVEL || 'info';
export const usePrettyPrint = isDev
  ? process.env.DEV_LOG_PRETTY === 'true'
  : process.env.LOG_PRETTY === 'true';
export const useAxiom = isDev ? process.env.DEV_LOG_ON_AXIOM === 'true' : true;

// Simple console logging control via environment variable
export const shouldLogToConsole = process.env.CONSOLE_LOGGING_ENABLED === 'true';

// Utility functions
export function shouldLog(level: LogLevel): boolean {
  const levels: Record<LogLevel, number> = {
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
  };

  const configuredLevel = logLevel as LogLevel;
  return levels[level] >= levels[configuredLevel];
}

// Format error to valid log
export function formatError(error?: Error): Record<string, any> | undefined {
  if (!error) return undefined;

  return {
    message: error.message,
    stack: error.stack,
    name: error.name,
  };
}






