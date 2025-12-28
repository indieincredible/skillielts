import { z } from 'zod';
import { logger } from '@/lib/logger';
import { PaymentError } from './errors';
import type {
  LemonSqueezyWebhookEvent,
  LemonSqueezyVariant,
  LemonSqueezySubscription,
  LemonSqueezyOrder,
  LemonSqueezyProduct,
} from '@/types/payments/lemonsqueezy';

// Zod schemas for runtime validation
export const LemonSqueezyVariantSchema = z.object({
  id: z.string(),
  type: z.literal('variants'),
  attributes: z.object({
    name: z.string(),
    price: z.number(),
    currency: z.string().optional(),
    interval: z.enum(['month', 'year']).nullable(),
    interval_count: z.number(),
    is_subscription: z.boolean(),
    product_id: z.number(),
    description: z.string().optional(),
    status: z.enum(['draft', 'published', 'pending']),
  }),
  relationships: z
    .object({
      product: z
        .object({
          data: z
            .object({
              type: z.literal('products'),
              id: z.string(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export const LemonSqueezySubscriptionSchema = z.object({
  id: z.string(),
  type: z.literal('subscriptions'),
  attributes: z.object({
    status: z.enum(['active', 'cancelled', 'expired', 'past_due', 'unpaid']),
    urls: z.object({
      customer_portal: z.string().url(),
      update_payment_method: z.string().url(),
    }),
    variant_name: z.string(),
    product_name: z.string(),
    customer_id: z.number(),
    variant_id: z.number(),
    card_brand: z.string().optional(),
    card_last_four: z.string().optional(),
    billing_anchor: z.number().optional(),
    created_at: z.string(),
    updated_at: z.string(),
    ends_at: z.string().optional(),
    renews_at: z.string().optional(),
  }),
});

export const LemonSqueezyOrderSchema = z.object({
  id: z.string(),
  type: z.literal('orders'),
  attributes: z.object({
    status: z.enum(['pending', 'paid', 'refunded']),
    total: z.number(),
    currency: z.string(),
    customer_id: z.number(),
    variant_id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export const LemonSqueezyProductSchema = z.object({
  id: z.string(),
  type: z.literal('products'),
  attributes: z.object({
    name: z.string(),
    description: z.string(),
    status: z.enum(['draft', 'published']),
    slug: z.string(),
    thumb_url: z.string().optional(),
  }),
  relationships: z.object({
    variants: z.object({
      data: z.array(
        z.object({
          type: z.literal('variants'),
          id: z.string(),
        })
      ),
    }),
  }),
});

export const LemonSqueezyWebhookEventSchema = z.object({
  meta: z.object({
    event_name: z.enum([
      'subscription_created',
      'subscription_updated',
      'subscription_cancelled',
      'order_created',
    ]),
    webhook_id: z.string(),
    webhook_signature: z.string().optional(),
  }),
  data: z.union([LemonSqueezySubscriptionSchema, LemonSqueezyOrderSchema]),
});

// Validation functions with proper error handling
export function validateWebhookEvent(data: unknown): LemonSqueezyWebhookEvent {
  try {
    return LemonSqueezyWebhookEventSchema.parse(data);
  } catch (error) {
    logger.error('Webhook validation failed', error as Error, {
      receivedData: typeof data === 'object' ? JSON.stringify(data) : String(data),
    });
    throw new PaymentError('webhook-invalid', 'Invalid webhook event structure');
  }
}

export function validateVariant(data: unknown): LemonSqueezyVariant {
  try {
    return LemonSqueezyVariantSchema.parse(data);
  } catch (error) {
    logger.error('Variant validation failed', error as Error, {
      receivedData: typeof data === 'object' ? JSON.stringify(data) : String(data),
    });
    throw new PaymentError('api-response', 'Invalid variant data structure');
  }
}

export function validateSubscription(data: unknown): LemonSqueezySubscription {
  try {
    return LemonSqueezySubscriptionSchema.parse(data);
  } catch (error) {
    logger.error('Subscription validation failed', error as Error, {
      receivedData: typeof data === 'object' ? JSON.stringify(data) : String(data),
    });
    throw new PaymentError('api-response', 'Invalid subscription data structure');
  }
}

export function validateOrder(data: unknown): LemonSqueezyOrder {
  try {
    return LemonSqueezyOrderSchema.parse(data);
  } catch (error) {
    logger.error('Order validation failed', error as Error, {
      receivedData: typeof data === 'object' ? JSON.stringify(data) : String(data),
    });
    throw new PaymentError('api-response', 'Invalid order data structure');
  }
}

// Safe parsing functions that return null on failure (for optional validation)
export function safeParseWebhookEvent(data: unknown): LemonSqueezyWebhookEvent | null {
  try {
    return validateWebhookEvent(data);
  } catch {
    return null;
  }
}

export function validateProduct(data: unknown): LemonSqueezyProduct {
  try {
    return LemonSqueezyProductSchema.parse(data);
  } catch (error) {
    logger.error('Product validation failed', error as Error, {
      receivedData: typeof data === 'object' ? JSON.stringify(data) : String(data),
    });
    throw new PaymentError('api-response', 'Invalid product data structure');
  }
}

export function safeParseVariant(data: unknown): LemonSqueezyVariant | null {
  try {
    return validateVariant(data);
  } catch {
    return null;
  }
}

export function safeParseProduct(data: unknown): LemonSqueezyProduct | null {
  try {
    return validateProduct(data);
  } catch {
    return null;
  }
}






