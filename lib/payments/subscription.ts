import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Lưu thông tin subscription từ LemonSqueezy vào database
 * @param subscriptionData Dữ liệu subscription từ LemonSqueezy
 * @param userId ID của user trong hệ thống
 * @param planId ID của plan liên quan
 */
export async function saveSubscription(
  subscriptionData: {
    lemonSqueezyId: string;
    orderId: number;
    name: string;
    email: string;
    status: string;
    statusFormatted: string;
    renewsAt?: string;
    endsAt?: string;
    trialEndsAt?: string;
    price: string;
    isUsageBased: boolean;
    isPaused: boolean;
    subscriptionItemId?: number;
    lemonSqueezyVariantId?: string | number;
    lemonSqueezyOrderId?: string | number;
  },
  userId: string,
  planId: number
) {
  try {
    const subscription = await db.subscription.upsert({
      where: { lemonSqueezyId: subscriptionData.lemonSqueezyId },
      update: {
        status: subscriptionData.status,
        statusFormatted: subscriptionData.statusFormatted,
        renewsAt: subscriptionData.renewsAt,
        endsAt: subscriptionData.endsAt,
        trialEndsAt: subscriptionData.trialEndsAt,
        price: subscriptionData.price,
        isPaused: subscriptionData.isPaused,
        lemonSqueezyVariantId: subscriptionData.lemonSqueezyVariantId?.toString(),
        lemonSqueezyOrderId: subscriptionData.lemonSqueezyOrderId?.toString(),
      },
      create: {
        lemonSqueezyId: subscriptionData.lemonSqueezyId,
        orderId: subscriptionData.orderId,
        name: subscriptionData.name,
        email: subscriptionData.email,
        status: subscriptionData.status,
        statusFormatted: subscriptionData.statusFormatted,
        renewsAt: subscriptionData.renewsAt,
        endsAt: subscriptionData.endsAt,
        trialEndsAt: subscriptionData.trialEndsAt,
        price: subscriptionData.price,
        isUsageBased: subscriptionData.isUsageBased,
        isPaused: subscriptionData.isPaused,
        subscriptionItemId: subscriptionData.subscriptionItemId,
        lemonSqueezyVariantId: subscriptionData.lemonSqueezyVariantId?.toString(),
        lemonSqueezyOrderId: subscriptionData.lemonSqueezyOrderId?.toString(),
        userId,
        planId,
      },
    });
    logger.info('Subscription saved', {
      id: subscription.id,
      lemonSqueezyId: subscriptionData.lemonSqueezyId,
    });
    return subscription;
  } catch (error) {
    logger.error('Failed to save subscription', error as Error, {
      lemonSqueezyId: subscriptionData.lemonSqueezyId,
    });
    throw error;
  }
}

/**
 * Lấy thông tin subscription của một user
 * @param userId ID của user
 */
export async function getUserSubscription(userId: string) {
  try {
    const subscription = await db.subscription.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { id: 'desc' },
    });
    logger.info('Retrieved user subscription', { userId, subscriptionId: subscription?.id });
    return subscription;
  } catch (error) {
    logger.error('Failed to retrieve user subscription', error as Error, { userId });
    throw error;
  }
}

/**
 * Lưu thông tin plan từ LemonSqueezy vào database
 * @param planData Dữ liệu plan từ LemonSqueezy
 */
export async function savePlan(planData: {
  productId: number;
  productName?: string;
  variantId: number;
  name: string;
  description?: string;
  price: string;
  isUsageBased: boolean;
  isOneTimePayment?: boolean;
  interval?: string;
  intervalCount?: number;
  trialInterval?: string;
  trialIntervalCount?: number;
  sort?: number;
}) {
  try {
    // Check variantId valid
    if (!planData.variantId) {
      logger.warn('Attempting to save plan with invalid variantId', { planData });
      throw new Error('Invalid variantId provided for plan upsert operation');
    }

    const plan = await db.plan.upsert({
      where: { variantId: planData.variantId },
      update: {
        productName: planData.productName || '',
        name: planData.name || '',
        description: planData.description || '',
        price: planData.price || '0',
        isUsageBased: planData.isUsageBased || false,
        isOneTimePayment: planData.isOneTimePayment || false,
        interval: planData.interval || '',
        intervalCount: planData.intervalCount || 0,
        trialInterval: planData.trialInterval || '',
        trialIntervalCount: planData.trialIntervalCount || 0,
        sort: planData.sort || 0,
      },
      create: {
        productId: planData.productId || 0,
        productName: planData.productName || '',
        variantId: planData.variantId,
        name: planData.name || '',
        description: planData.description || '',
        price: planData.price || '0',
        isUsageBased: planData.isUsageBased || false,
        isOneTimePayment: planData.isOneTimePayment || false,
        interval: planData.interval || '',
        intervalCount: planData.intervalCount || 0,
        trialInterval: planData.trialInterval || '',
        trialIntervalCount: planData.trialIntervalCount || 0,
        sort: planData.sort || 0,
      },
    });
    logger.info('Plan saved', { id: plan.id, variantId: planData.variantId });
    return plan;
  } catch (error) {
    logger.error('Failed to save plan', error as Error, { variantId: planData.variantId });
    throw error;
  }
}






