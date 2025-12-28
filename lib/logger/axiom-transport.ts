// Environment-based configurations
const isDev = process.env.NODE_ENV !== 'production';

// Base logger options
const baseOptions = {
  level: isDev ? 'debug' : 'info',
  base: {
    env: process.env.NODE_ENV || 'development',
    revision: process.env.VERCEL_GIT_COMMIT_SHA,
  },
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  redact: [
    'password',
    'passwordConfirmation',
    'authorization',
    '*.password',
    '*.passwordConfirmation',
    '*.authorization',
    '*.token',
  ],
};

// Options for development (pretty printing)
const devOptions = {
  ...baseOptions,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
};

// Production options
const prodOptions = {
  ...baseOptions,
  // pino-axiom transport will be added in index.ts
};

// Choose options based on environment
export const pinoConfig = isDev ? devOptions : prodOptions;






