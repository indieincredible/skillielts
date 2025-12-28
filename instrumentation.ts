// Only import Sentry if enabled
const SENTRY_ENABLED = process.env.NODE_ENV === 'production' || process.env.ENABLE_SENTRY === 'true';

export async function register() {
  if (SENTRY_ENABLED) {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config');
    }
  }
}

// Only export onRequestError if Sentry is enabled
let onRequestError: typeof import('@sentry/nextjs').captureRequestError | undefined;

if (SENTRY_ENABLED) {
  import('@sentry/nextjs').then((Sentry) => {
    onRequestError = Sentry.captureRequestError;
  });
}

export { onRequestError };






