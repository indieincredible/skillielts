import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  handleLemonSqueezySubscriptionChange,
  handleLemonSqueezyOrderCreated,
} from '@/lib/payments/lemon-squeezy';
import { logger } from '@/lib/logger';
import { saveWebhookEvent, updateWebhookEventStatus } from '@/lib/payments/webhook';
import { saveSubscription, savePlan } from '@/lib/payments/subscription';
import {
  verifyLemonSqueezyWebhook,
  parseLemonSqueezyWebhookEvent,
} from '@/lib/payments/lemon-squeezy-helpers';

// Webhook helper functions have been moved to lib/payments/lemon-squeezy-helpers.ts

/**
 * Update lemonSqueezyCustomerId for a user
 */
async function updateUserLemonSqueezyCustomerId(
  userId: string,
  customerId: string | number,
  source: string
): Promise<void> {
  const customerIdString = customerId.toString();

  await db.user.update({
    where: { id: userId },
    data: { lemonSqueezyCustomerId: customerIdString },
  });

  logger.info(`Updated Lemon Squeezy customer ID from ${source}`, {
    userId,
    customerId: customerIdString,
  });
}

/**
 * Handle webhooks related to subscriptions (not direct payments)
 */
async function handleSubscriptionEvent(
  data: any,
  userId: string,
  subscriptionData: any
): Promise<void> {
  // Only proceed when all required data is present
  const firstSubscriptionItem = subscriptionData.first_subscription_item;

  if (!subscriptionData.product_id || !subscriptionData.variant_id || !firstSubscriptionItem) {
    logger.warn('Missing subscription data for plan creation', {
      userId,
      subscriptionId: data.data.id,
      hasProductId: !!subscriptionData.product_id,
      hasVariantId: !!subscriptionData.variant_id,
      hasFirstItem: !!firstSubscriptionItem,
    });
    return;
  }

  // Extract variant information from subscription attributes
  const attributes = subscriptionData?.attributes || {};
  const isSubscription =
    attributes.is_subscription === undefined ? true : attributes.is_subscription;
  const interval = attributes.interval || '';
  const intervalCount = attributes.interval_count || 0;

  // Persist plan information
  const planData = {
    productId: subscriptionData.product_id,
    productName: subscriptionData.product_name,
    variantId: subscriptionData.variant_id,
    name: subscriptionData.product_name || subscriptionData.variant_name,
    description: '',
    price: firstSubscriptionItem ? firstSubscriptionItem.price_id.toString() : '0',
    isUsageBased: firstSubscriptionItem.is_usage_based || false,
    isOneTimePayment: !isSubscription, // One-time payment nếu không phải subscription
    interval: isSubscription ? interval : 'lifetime', // Mark lifetime for one-time package
    intervalCount: intervalCount,
    trialInterval: '',
    trialIntervalCount: 0,
    sort: 0,
  };

  const plan = await savePlan(planData);

  // Persist subscription information
  const subscription = {
    lemonSqueezyId: data.data.id,
    orderId: subscriptionData.order_id,
    name: subscriptionData.user_name,
    email: subscriptionData.user_email,
    status: subscriptionData.status,
    statusFormatted: subscriptionData.status_formatted,
    renewsAt: subscriptionData.renews_at,
    endsAt: subscriptionData.ends_at,
    trialEndsAt: subscriptionData.trial_ends_at,
    price: firstSubscriptionItem ? firstSubscriptionItem.price_id.toString() : '0',
    isUsageBased: false,
    isPaused: subscriptionData.pause !== null,
    subscriptionItemId: firstSubscriptionItem ? firstSubscriptionItem.id : undefined,
    // Add fields to save to Subscription table
    lemonSqueezyVariantId: subscriptionData.variant_id,
    lemonSqueezyOrderId: subscriptionData.order_id,
  };

  await saveSubscription(subscription, userId, plan.id);
  logger.info('Saved subscription and plan data', {
    subscriptionId: data.data.id,
    planId: plan.id,
    userId,
  });
}

/**
 * Handle specific webhook events
 */
async function processWebhookEvent(eventName: string, data: any): Promise<void> {
  try {
    switch (eventName) {
      case 'subscription_created':
        // Update lemonSqueezyCustomerId for user
        if (data.data?.attributes?.customer_id && data.meta?.custom_data?.user_id) {
          await updateUserLemonSqueezyCustomerId(
            data.meta.custom_data.user_id,
            data.data.attributes.customer_id,
            'subscription'
          );
        }

        // Handle subscription created event
        logger.info('Handling subscription created event', {
          eventName,
          subscriptionId: data.data.id,
        });
        await handleLemonSqueezySubscriptionChange(data);
        break;

      case 'subscription_updated':
      case 'subscription_cancelled':
      case 'subscription_expired':
      case 'subscription_resumed':
      case 'subscription_paused':
        // Handle subscription lifecycle event
        logger.info('Handling subscription lifecycle event', {
          eventName,
          subscriptionId: data.data.id,
        });
        await handleLemonSqueezySubscriptionChange(data);
        break;

      case 'order_created':
        // Update lemonSqueezyCustomerId for user
        if (data.data?.attributes?.customer_id && data.meta?.custom_data?.user_id) {
          await updateUserLemonSqueezyCustomerId(
            data.meta.custom_data.user_id,
            data.data.attributes.customer_id,
            'order'
          );
        }

        // Handle order event
        logger.info('Handling order event', {
          eventName,
          orderId: data.data.id,
        });
        await handleLemonSqueezyOrderCreated(data);
        break;

      case 'subscription_payment_success':
        logger.info('Payment success for subscription', {
          subscriptionId: data.data?.attributes?.subscription_id || data.data.id,
        });
        // Additional handling can be added if needed
        break;

      case 'subscription_payment_failed':
        logger.warn('Payment failed for subscription', {
          subscriptionId: data.data?.attributes?.subscription_id || data.data.id,
        });
        // Optionally notify the user or add extra handling
        break;

      case 'subscription_payment_recovered':
        logger.info('Payment recovered for subscription', {
          subscriptionId: data.data?.attributes?.subscription_id || data.data.id,
        });
        // Optionally update subscription status again
        break;

      case 'subscription_refunded':
        logger.info('Subscription refunded', {
          subscriptionId: data.data.id,
        });
        // Optionally update user status or send a notification
        break;

      case 'order_refunded':
        logger.info('Order refunded', {
          orderId: data.data.id,
        });
        // Optionally update order status or send a notification
        break;

      default:
        logger.warn('Unhandled Lemon Squeezy webhook event', { eventName });
        break;
    }
  } catch (error) {
    logger.error('Error processing specific webhook event', error as Error, {
      eventName,
      dataId: data.data?.id,
    });
    throw error; // Re-throw to handle at a higher level if needed
  }
}

/**
 * Classify and perform initial handling based on event type
 */
async function processInitialWebhookData(data: any): Promise<void> {
  if (!data.meta || !data.meta.event_name) {
    logger.error('Invalid webhook event structure', undefined, { data });
    throw new Error('Invalid webhook event structure');
  }

  const eventName = data.meta.event_name;
  logger.info('Processing Lemon Squeezy webhook event', { eventName });

  // Special handling for subscription-related events
  if (eventName.includes('subscription')) {
    const customData = data.meta?.custom_data;
    const userId = customData?.user_id;
    const subscriptionData = data.data?.attributes;

    // Update lemonSqueezyCustomerId for user from any subscription event
    if (subscriptionData?.customer_id && userId) {
      await updateUserLemonSqueezyCustomerId(
        userId,
        subscriptionData.customer_id,
        'subscription_event'
      );
    }

    // Branch logic depending on the specific subscription event
    if (eventName.startsWith('subscription_payment_')) {
      // Payment events often do not contain variant_id and product_id
      logger.info('Processing subscription payment event', {
        eventName,
        subscriptionId: subscriptionData?.subscription_id,
        invoiceId: data.data?.id,
      });
    } else if (subscriptionData && userId) {
      // Handle subscription lifecycle event
      await handleSubscriptionEvent(data, userId, subscriptionData);
    }
  }

  // Handle the event by its specific type
  await processWebhookEvent(eventName, data);
}

/**
 * Main handler for Lemon Squeezy webhooks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
    logger.error('LEMON_SQUEEZY_WEBHOOK_SECRET is not set');
    return new NextResponse('Webhook Error: Missing configuration', { status: 500 });
  }

  try {
    logger.info('Received Lemon Squeezy webhook request');

    // Read request body and verify webhook
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
      logger.error('Missing webhook signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify webhook signature
    const isValid = verifyLemonSqueezyWebhook(rawBody, signature);
    if (!isValid) {
      logger.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook payload
    const data = parseLemonSqueezyWebhookEvent(rawBody);

    // Persist webhook event to database
    const webhookEvent = await saveWebhookEvent(data.meta?.event_name || 'unknown', data);

    // Process webhook data
    try {
      await processInitialWebhookData(data);

      // Mark webhook event as processed successfully
      await updateWebhookEventStatus(webhookEvent.id, true);

      return NextResponse.json({ success: true });
    } catch (error) {
      const processingError = error as Error;
      logger.error('Error processing webhook data', processingError);
      // Mark webhook event as processed with error details
      await updateWebhookEventStatus(
        webhookEvent.id,
        true,
        processingError.message || 'Processing failed'
      );
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  } catch (error) {
    logger.error('Error handling LemonSqueezy webhook request', error as Error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}






