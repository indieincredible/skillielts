import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { LemonSqueezyWebhookEvent } from '@/types/payments/lemonsqueezy';

/**
 * Save a webhook event from LemonSqueezy to database
 * @param eventName Name of the event
 * @param body Validated webhook payload
 */
export async function saveWebhookEvent(eventName: string, body: LemonSqueezyWebhookEvent) {
  try {
    const webhookEvent = await db.webhookEvent.create({
      data: {
        eventName,
        body: body as any, // Prisma JSON field requires any type
      },
    });
    logger.info('Webhook event saved', { id: webhookEvent.id, eventName });
    return webhookEvent;
  } catch (error) {
    logger.error('Failed to save webhook event', error as Error, { eventName });
    throw error;
  }
}

/**
 * Update the processing status of a webhook event
 * @param id ID of the webhook event
 * @param processed Whether it has been processed
 * @param processingError Error if any during processing
 */
export async function updateWebhookEventStatus(
  id: number,
  processed: boolean,
  processingError?: string
) {
  try {
    const webhookEvent = await db.webhookEvent.update({
      where: { id },
      data: {
        processed,
        processingError,
      },
    });
    logger.info('Webhook event status updated', { id, processed, processingError });
    return webhookEvent;
  } catch (error) {
    logger.error('Failed to update webhook event status', error as Error, { id });
    throw error;
  }
}

/**
 * Get unprocessed webhook events
 */
export async function getUnprocessedWebhookEvents() {
  try {
    const events = await db.webhookEvent.findMany({
      where: { processed: false },
      orderBy: { createdAt: 'asc' },
    });
    logger.info('Retrieved unprocessed webhook events', { count: events.length });
    return events;
  } catch (error) {
    logger.error('Failed to retrieve unprocessed webhook events', error as Error);
    throw error;
  }
}






