import { User } from '@prisma/client';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import type { LemonSqueezyWebhookEvent } from '@/types/payments/lemonsqueezy';

/**
 * Update user subscription information
 */
export async function updateUserSubscription(
  userId: string,
  data: {
    planName?: string;
    subscriptionStatus?: string;
  }
): Promise<User> {
  const updateData: {
    planName?: string;
    subscriptionStatus?: string;
    role?: 'USER' | 'PREMIUM' | 'ADMIN';
  } = {
    planName: data.planName,
    subscriptionStatus: data.subscriptionStatus,
  };

  // If subscription is active or on trial, upgrade user to PREMIUM
  if (data.subscriptionStatus === 'active' || data.subscriptionStatus === 'on_trial') {
    updateData.role = 'PREMIUM';
  }

  // If subscription is cancelled or expired, downgrade user to USER
  if (data.subscriptionStatus === 'cancelled' || data.subscriptionStatus === 'expired') {
    updateData.role = 'USER';
  }

  // Update User information
  return db.user.update({
    where: { id: userId },
    data: updateData,
  });
}

/**
 * Verify webhook authentication from Lemon Squeezy
 * Similar to construct event in Stripe
 */
export function verifyLemonSqueezyWebhook(payload: string, signature: string): boolean {
  // Get secret from env
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('LEMON_SQUEEZY_WEBHOOK_SECRET is not set');
  }

  try {
    // Lemon Squeezy uses HMAC SHA-256 to authenticate webhook

    // Create HMAC from payload and secret
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');

    // Compare signature
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error verifying Lemon Squeezy webhook: ${errorMessage}`);
    return false;
  }
}

/**
 * Parse and validate webhook event from Lemon Squeezy
 */
export function parseLemonSqueezyWebhookEvent(payload: string): LemonSqueezyWebhookEvent {
  try {
    const event = JSON.parse(payload);

    // Check basic structure of event
    if (!event.meta || !event.meta.event_name || !event.data) {
      throw new Error('Invalid Lemon Squeezy webhook event structure');
    }

    return event as LemonSqueezyWebhookEvent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error parsing Lemon Squeezy webhook event: ${errorMessage}`);
    throw new Error('Invalid webhook payload');
  }
}






