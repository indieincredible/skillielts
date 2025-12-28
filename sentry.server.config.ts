// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { logger } from "./lib/logger";

// Only initialize Sentry in production or if explicitly enabled
const SENTRY_ENABLED = process.env.NODE_ENV === 'production' || process.env.ENABLE_SENTRY === 'true';

if (SENTRY_ENABLED) {
  logger.info('Initializing Sentry on server');
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
} else {
  logger.info('Sentry disabled on server (development mode)');
}






