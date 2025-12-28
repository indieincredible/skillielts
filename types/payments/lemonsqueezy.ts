/**
 * LemonSqueezy Payment System Type Definitions
 * Comprehensive type safety for payment operations
 */

// Base LemonSqueezy API structures
export interface LemonSqueezyVariant {
  id: string;
  type: 'variants';
  attributes: {
    name: string;
    price: number; // in cents
    currency?: string;
    interval: 'month' | 'year' | null;
    interval_count: number;
    is_subscription: boolean;
    product_id: number;
    description?: string;
    status: 'draft' | 'published' | 'pending';
  };
  relationships?: {
    product?: {
      data?: {
        type: 'products';
        id: string;
      };
    };
  };
}

export interface LemonSqueezyProduct {
  id: string;
  type: 'products';
  attributes: {
    name: string;
    description: string;
    status: 'draft' | 'published';
    slug: string;
    thumb_url?: string;
  };
  relationships: {
    variants: {
      data: Array<{
        type: 'variants';
        id: string;
      }>;
    };
  };
}

export interface LemonSqueezySubscription {
  id: string;
  type: 'subscriptions';
  attributes: {
    status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'unpaid';
    urls: {
      customer_portal: string;
      update_payment_method: string;
    };
    variant_name: string;
    product_name: string;
    customer_id: number;
    variant_id: number;
    card_brand?: string;
    card_last_four?: string;
    billing_anchor?: number;
    created_at: string;
    updated_at: string;
    ends_at?: string;
    renews_at?: string;
  };
}

export interface LemonSqueezyOrder {
  id: string;
  type: 'orders';
  attributes: {
    status: 'pending' | 'paid' | 'refunded';
    total: number;
    currency: string;
    customer_id: number;
    variant_id: number;
    created_at: string;
    updated_at: string;
  };
}

// Webhook Event Types
export interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: 'subscription_created' | 'subscription_updated' | 'subscription_cancelled' | 'order_created';
    webhook_id: string;
    webhook_signature?: string;
  };
  data: LemonSqueezySubscription | LemonSqueezyOrder;
}

// API Response wrappers
export interface LemonSqueezyApiResponse<T> {
  data: T;
  meta?: {
    page: {
      currentPage: number;
      from: number;
      lastPage: number;
      perPage: number;
      to: number;
      total: number;
    };
  };
  links?: {
    first: string;
    last: string;
  };
}

export interface LemonSqueezyApiError {
  error: {
    message: string;
    status: number;
  };
}

// Legacy compatibility types
export interface EventData {
  data: LemonSqueezySubscription | LemonSqueezyOrder;
  meta?: {
    custom_data?: {
      user_id?: string;
    };
  };
}






