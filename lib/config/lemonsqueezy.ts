import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

/**
 * Ensure required environment variables are set and configure Lemon Squeezy SDK.
 * Throws an error if missing environment variables or SDK setup fails.
 */
export function configureLemonSqueezy() {
  const requiredVars = [
    'LEMON_SQUEEZY_API_KEY',
    'LEMON_SQUEEZY_STORE_ID',
    'LEMON_SQUEEZY_WEBHOOK_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required LEMON_SQUEEZY environment variables: ${missingVars.join(
        ', '
      )}. Please set them in your .env file.`
    );
  }

  // Initialize SDK
  lemonSqueezySetup({ apiKey: process.env.LEMON_SQUEEZY_API_KEY });
}






