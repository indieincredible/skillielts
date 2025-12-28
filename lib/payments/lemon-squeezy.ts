import { listVariants, listProducts, getSubscription } from '@lemonsqueezy/lemonsqueezy.js';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { updateUserSubscription } from './lemon-squeezy-helpers';
import { PaymentError } from './errors';
import { configureLemonSqueezy } from '../config/lemonsqueezy';
import { Subscription, User } from '@prisma/client';
import { validateWebhookEvent, validateVariant, validateProduct } from './validation';
import type {
  LemonSqueezyWebhookEvent,
  LemonSqueezySubscription as TypedLemonSqueezySubscription,
  LemonSqueezyOrder as TypedLemonSqueezyOrder,
  LemonSqueezyVariant,
  LemonSqueezyProduct,
} from '@/types/payments/lemonsqueezy';

// Define data type returned from Prisma
interface UserWithSubscriptions extends User {
  subscriptions: Array<
    Subscription & {
      plan: {
        id: number;
        name: string;
        variantId: number;
        price: string;
        isUsageBased: boolean;
        interval: string;
        intervalCount: number;
        trialInterval: string | null;
        trialIntervalCount: number | null;
      };
    }
  >;
}

/**
 * Find user by Lemon Squeezy customer ID
 * @param customerId Customer ID from Lemon Squeezy
 * @returns User information and subscription
 */
export async function getUserByLemonSqueezyCustomerId(
  customerId: string
): Promise<UserWithSubscriptions | null> {
  try {
    logger.info('Finding user by Lemon Squeezy customer ID', { customerId });

    const user = (await db.user.findFirst({
      where: {
        OR: [
          { lemonSqueezyCustomerId: customerId },
          { id: customerId }, // Fallback: check if customerId is actually userId
        ],
      },
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })) as UserWithSubscriptions | null;

    if (!user) {
      logger.error(`User not found with Lemon Squeezy customer ID: ${customerId}`);
      return null;
    }

    logger.info('User found with Lemon Squeezy customer ID', {
      userId: user.id,
      lemonSqueezyCustomerId: user.lemonSqueezyCustomerId,
    });

    return user;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error finding user by Lemon Squeezy customer ID ${customerId}: ${errorMessage}`);
    return null;
  }
}

// Ensure SDK is initialized when needed
configureLemonSqueezy();

/**
 * Get customer portal URL from Lemon Squeezy for user
 * @param userId User ID in the system
 * @returns URL to customer portal
 */
export async function getCustomerPortalURL(userId: string): Promise<string> {
  try {
    logger.info('Getting customer portal URL', { userId });
    configureLemonSqueezy();

    // Check user in DB
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.error('User not found in database for customer portal');
      throw new PaymentError('user-not-found', 'User not found in database');
    }

    if (!user.lemonSqueezyCustomerId) {
      logger.error('No LemonSqueezy customer ID found');
      throw new PaymentError('customer-portal-error', 'No LemonSqueezy customer ID found');
    }

    // Find user's latest subscription
    const subscription = await db.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    logger.info('Found subscription for user', { userId, subscriptionId: subscription?.id });

    // If subscription exists and has lemonSqueezyId, get information from API
    if (subscription?.lemonSqueezyId) {
      const result = await getSubscription(subscription.lemonSqueezyId);

      if (result?.data?.data?.attributes?.urls?.customer_portal) {
        const portalUrl = result.data.data.attributes.urls.customer_portal;
        logger.info('Retrieved customer portal URL from API');
        return portalUrl;
      }
    }

    // Fallback when URL cannot be found from API or no subscription exists
    // This is the default URL for customer portal
    const defaultPortalUrl = `https://skillielts.lemonsqueezy.com/billing?customer_id=${user.lemonSqueezyCustomerId}`;
    logger.info('Using default customer portal URL');

    return defaultPortalUrl;
  } catch (error) {
    if (error instanceof PaymentError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error creating Lemon Squeezy customer portal URL: ${errorMessage}`);
    throw new PaymentError(
      'customer-portal-error',
      `Failed to get customer portal URL: ${errorMessage}`
    );
  }
}

/**
 * Process webhooks from Lemon Squeezy
 * @param event Webhook event from Lemon Squeezy (must be properly typed)
 */
export async function handleLemonSqueezyWebhook(event: unknown): Promise<boolean> {
  try {
    // 🔒 STEP 1: Validate unknown input to proper type
    const validatedEvent = validateWebhookEvent(event);

    logger.info(`Processing webhook event: ${validatedEvent.meta.event_name}`, {
      webhookId: validatedEvent.meta.webhook_id,
      eventType: validatedEvent.meta.event_name,
    });

    // 🔒 STEP 2: Route to appropriate handler based on event type
    switch (validatedEvent.meta.event_name) {
      case 'subscription_created':
      case 'subscription_updated':
        return await handleLemonSqueezySubscriptionChange(validatedEvent);

      case 'subscription_cancelled':
        return await handleLemonSqueezySubscriptionChange(validatedEvent);

      case 'order_created':
        return await handleLemonSqueezyOrderCreated(validatedEvent);

      default:
        logger.warn(`Unhandled webhook event type: ${validatedEvent.meta.event_name}`);
        return false;
    }
  } catch (error) {
    if (error instanceof PaymentError) {
      logger.error(`Payment error in webhook processing`, error, { code: error.code });
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error handling webhook event: ${errorMessage}`, error as Error);

    // Remove console.error - use proper logging only
    throw new PaymentError('webhook-processing', `Failed to process webhook: ${errorMessage}`);
  }
}

/**
 * Handle subscription change from Lemon Squeezy webhook
 * @param event Validated webhook event containing subscription data
 */
export async function handleLemonSqueezySubscriptionChange(
  event: LemonSqueezyWebhookEvent
): Promise<boolean> {
  try {
    // 🔒 STEP 1: Ensure event contains subscription data
    if (event.data.type !== 'subscriptions') {
      logger.error('[Lemon Squeezy] Event data is not a subscription', undefined, {
        eventType: event.meta.event_name,
        dataType: event.data.type,
      });
      return false;
    }

    const subscriptionData = event.data as TypedLemonSqueezySubscription;
    const lemonSqueezyId = subscriptionData.id;
    const customerId = subscriptionData.attributes.customer_id.toString();
    const variantId = subscriptionData.attributes.variant_id?.toString();
    const status = subscriptionData.attributes.status || 'unknown';

    logger.info(
      `[Lemon Squeezy] Webhook subscription change: ${lemonSqueezyId} for customer ${customerId}`
    );
    logger.debug('Subscription details', {
      lemonSqueezyId,
      customerId,
      variantId,
      status,
    });

    // Find user by Lemon Squeezy customer ID
    const user = await getUserByLemonSqueezyCustomerId(customerId);

    if (!user) {
      logger.warn(`[Lemon Squeezy] No user found for customer ID: ${customerId}`);
      return false;
    }

    // Update Subscription in database
    // Find subscription by lemonSqueezyId
    const existingSubscription = await db.subscription.findFirst({
      where: { lemonSqueezyId },
    });

    if (existingSubscription) {
      // Update subscription
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status,
          statusFormatted: status, // May need to format based on requirements
          lemonSqueezyVariantId: variantId,
        },
      });
      logger.info(`Updated existing subscription: ${existingSubscription.id}`);
    } else {
      logger.warn(`No subscription found with lemonSqueezyId: ${lemonSqueezyId}`);
    }

    // Update user information if needed
    await updateUserSubscription(user.id, {
      subscriptionStatus: status,
    });

    logger.info(`[Lemon Squeezy] Subscription change processed successfully: ${lemonSqueezyId}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error handling subscription change: ${errorMessage}`);
    console.error('Error handling subscription change:', error);
    throw new Error('Failed to handle subscription change');
  }
}

/**
 * Handle order created from Lemon Squeezy webhook
 * @param event Validated webhook event containing order data
 */
export async function handleLemonSqueezyOrderCreated(
  event: LemonSqueezyWebhookEvent
): Promise<boolean> {
  try {
    // 🔒 STEP 1: Ensure event contains order data
    if (event.data.type !== 'orders') {
      logger.error('[Lemon Squeezy] Event data is not an order', undefined, {
        eventType: event.meta.event_name,
        dataType: event.data.type,
      });
      return false;
    }

    const orderData = event.data as TypedLemonSqueezyOrder;
    const customerId = orderData.attributes.customer_id.toString();

    logger.info(`[Lemon Squeezy] Order created: ${orderData.id} for customer ${customerId}`);
    logger.debug('Order details', {
      total: orderData.attributes.total,
      currency: orderData.attributes.currency,
      status: orderData.attributes.status,
    });

    // Find user by Lemon Squeezy customer ID
    const user = await getUserByLemonSqueezyCustomerId(customerId);

    if (!user) {
      logger.warn(`[Lemon Squeezy] No user found for customer ID: ${customerId}`);
      return false;
    }

    // TODO: Implement order processing logic
    // - Update user status
    // - Record payment
    // - Activate features if needed

    logger.info(`[Lemon Squeezy] Order processed successfully: ${orderData.id}`);
    return true;
  } catch (error) {
    logger.error('Error handling Lemon Squeezy order created:', error as Error);
    return false;
  }
}

/**
 * Get prices from Lemon Squeezy
 * Similar to getStripePrices in Stripe
 *
 * @param revalidate Optional revalidation time in seconds, defaults to 300 (5 minutes)
 */
export async function getLemonSqueezyPrices(revalidate: number = 300) {
  try {
    // Ensure API is configured
    configureLemonSqueezy();

    // listVariants returns an object containing an array of data
    const result = await listVariants();

    if (result.error) {
      logger.error('Error getting Lemon Squeezy prices:', result.error);
      throw new Error('Failed to get prices');
    }

    if (!result.data) {
      return [];
    }

    // Log to debug response metadata
    logger.debug('Lemon Squeezy variants response metadata:', {
      dataType: typeof result.data,
      hasData: !!result.data,
      isArray: Array.isArray(result.data),
      revalidateSeconds: revalidate,
    });

    // Parse the data properly and return variants
    let rawVariants: unknown[] = [];

    try {
      // Log full data as JSON string for debugging
      const fullInspection = JSON.stringify(result.data, null, 2);
      logger.debug('Lemon Squeezy variants full data', { data: fullInspection });

      // Handle different data formats that might come from the API
      if (typeof result.data === 'string') {
        try {
          const parsed = JSON.parse(result.data);
          if (parsed.data && Array.isArray(parsed.data)) {
            rawVariants = parsed.data;
          }
        } catch (parseError) {
          logger.error('Error parsing variant data string:', parseError as Error);
          return [];
        }
      } else if (result.data && 'data' in result.data && Array.isArray(result.data.data)) {
        rawVariants = result.data.data;
      } else if (Array.isArray(result.data)) {
        rawVariants = result.data;
      } else {
        logger.error('Unexpected Lemon Squeezy API response structure:', undefined, {
          dataType: typeof result.data,
          sample: JSON.stringify(result.data).substring(0, 100),
        });
        return [];
      }

      // Log variants info for debugging
      logger.info(`Found ${rawVariants.length} pricing variants from Lemon Squeezy API`);

      // Filter variants by store ID first
      const storeId = process.env.LEMON_SQUEEZY_STORE_ID;

      // Get products to map store IDs
      const productsResult = await listProducts();
      const storeProducts: Set<number> = new Set();

      if (productsResult.data && !productsResult.error) {
        const products = Array.isArray(productsResult.data)
          ? productsResult.data
          : (productsResult.data as any).data || [];

        products.forEach((product: any) => {
          if (product.attributes?.store_id?.toString() === storeId) {
            storeProducts.add(parseInt(product.id));
            logger.debug(`Product ${product.id} belongs to store ${storeId}`);
          }
        });
      }

      const filteredVariants = rawVariants.filter((variant: any) => {
        const productId = variant.attributes?.product_id;
        const belongsToStore = storeProducts.has(productId);
        logger.debug(
          `Variant ${variant.id} product_id: ${productId}, belongs to store: ${belongsToStore}`
        );
        return belongsToStore;
      });

      logger.info(`Filtered to ${filteredVariants.length} variants for store ${storeId}`);

      // Validate and process each variant
      const validatedVariants: LemonSqueezyVariant[] = [];

      for (const rawVariant of filteredVariants) {
        try {
          const validatedVariant = validateVariant(rawVariant);
          validatedVariants.push(validatedVariant);
        } catch (error) {
          logger.warn('Skipping invalid variant', {
            error: error instanceof Error ? error.message : String(error),
            rawVariant,
          });
          continue;
        }
      }

      logger.info(
        `Successfully validated ${validatedVariants.length}/${rawVariants.length} variants`
      );

      // Process validated data to the expected format
      return validatedVariants.map((variant: LemonSqueezyVariant) => {
        // Handle special case for Lifetime plan: has interval but is_subscription = false
        const isLifetime =
          variant.attributes?.is_subscription === false && variant.attributes?.interval;

        // Log individual variant details for debugging
        logger.debug(`Processing variant: ${variant.id}`, {
          name: variant.attributes?.name,
          price: variant.attributes?.price,
          interval: variant.attributes?.interval,
          isSubscription: variant.attributes?.is_subscription,
        });

        return {
          id: variant.id,
          productId: variant.relationships?.product?.data?.id,
          name: variant.attributes?.name || 'Unknown Variant',
          description: variant.attributes?.description || '',
          price: variant.attributes?.price || 0, // Unit in cents
          currency: variant.attributes?.currency || 'USD',
          // If it's a lifetime plan, set interval = 'once'
          interval: isLifetime ? 'once' : variant.attributes?.interval || null,
          intervalCount: variant.attributes?.interval_count || 1,
          // is_subscription from API is the most reliable source of data
          isSubscription:
            variant.attributes?.is_subscription ?? Boolean(variant.attributes?.interval),
        };
      });
    } catch (jsonError) {
      logger.error('Error processing Lemon Squeezy variants data:', jsonError as Error);
      return [];
    }
  } catch (error) {
    logger.error('Error getting Lemon Squeezy prices:', error as Error);
    throw new Error('Failed to get prices');
  }
}

/**
 * Get list of products from Lemon Squeezy
 * Similar to getStripeProducts in Stripe
 */
export async function getLemonSqueezyProducts() {
  try {
    logger.info('Getting Lemon Squeezy products');
    // listProducts returns an object containing an array of data
    const result = await listProducts();

    if (result.error) {
      logger.error('Error getting Lemon Squeezy products:', result.error);
      throw new Error('Failed to get products');
    }

    // ...

    if (!result.data) {
      logger.warn('No data returned from Lemon Squeezy products API');
      return [];
    }

    // ...
    // Log to debug response metadata
    logger.debug('Lemon Squeezy products response metadata', {
      dataType: typeof result.data,
      hasData: !!result.data,
      isArray: Array.isArray(result.data),
    });

    // Log full data with util.inspect to display all nested fields
    try {
      // Convert to JSON string with full depth
      const fullInspection = JSON.stringify(result.data, null, 2);
      logger.debug('Lemon Squeezy products full data', { data: fullInspection });

      // Log product attributes
      if (result.data?.data && Array.isArray(result.data.data)) {
        result.data.data.forEach((product, index) => {
          logger.debug(`Product ${index + 1} (ID: ${product.id}) attributes`, {
            attributes: product.attributes,
          });
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(
        `Error inspecting Lemon Squeezy products data: ${errorMessage}`,
        err instanceof Error ? err : undefined
      );
    }

    // Determine products array based on data structure
    let rawProducts: unknown[] = [];

    // Check if result.data is an array
    if (Array.isArray(result.data)) {
      rawProducts = result.data;
    }
    // Check if result.data.data is an array (common structure in API)
    else if (result.data.data && Array.isArray(result.data.data)) {
      rawProducts = result.data.data;
    }
    // If not an array, log error and return empty array
    else {
      logger.error(
        'Unexpected Lemon Squeezy API response structure for products',
        new Error('Unexpected data structure'),
        { responseData: result.data }
      );
      return [];
    }

    // Validate and process each product
    const validatedProducts: LemonSqueezyProduct[] = [];

    for (const rawProduct of rawProducts) {
      try {
        const validatedProduct = validateProduct(rawProduct);
        validatedProducts.push(validatedProduct);
      } catch (error) {
        logger.warn('Skipping invalid product', {
          error: error instanceof Error ? error.message : String(error),
          rawProduct,
        });
        continue;
      }
    }

    logger.info(
      `Successfully validated ${validatedProducts.length}/${rawProducts.length} products`
    );

    // Process validated data to the expected format
    return validatedProducts.map((product: LemonSqueezyProduct) => {
      logger.debug('Processing product', { id: product.id, name: product.attributes?.name });
      return {
        id: product.id,
        name: product.attributes?.name || 'Unknown Product',
        description: product.attributes?.description || '',
        status: product.attributes?.status || 'draft',
        variants:
          product.relationships?.variants?.data?.map((variant: { id: string }) => variant.id) || [],
      };
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      `Error getting Lemon Squeezy products: ${errorMessage}`,
      error instanceof Error ? error : new Error(String(error))
    );
    throw new Error('Failed to get products');
  }
}






