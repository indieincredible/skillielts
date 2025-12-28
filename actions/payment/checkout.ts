'use server';

import { logger } from '@/lib/logger';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { configureLemonSqueezy } from '@/lib/config/lemonsqueezy';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { PaymentError } from '@/lib/payments/errors';

/**
 * Create checkout URL for a Lemon Squeezy product
 * @param variantId Product variant ID
 * @param embed Whether to allow embedding in iframe
 * @returns Checkout URL
 */
export async function getCheckoutURL(variantId: string, embed = false) {
  configureLemonSqueezy();

  const session = await currentUser();

  if (!session?.id) {
    throw new PaymentError('authentication', 'You need to be logged in to continue.');
  }

  const user = await db.user.findUnique({
    where: { id: session.id },
  });

  if (!user) {
    throw new PaymentError('user-not-found', 'User not found in the database.');
  }

  try {
    // Convert variantId to number
    const variantIdNumber = Number(variantId);
    logger.info('Creating checkout URL', { variantId, embed });
    
    if (isNaN(variantIdNumber) || variantIdNumber <= 0) {
      throw new PaymentError('invalid-input', `Invalid variant ID: ${variantId}`);
    }

    // Get store ID from environment variable
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    
    if (!storeId) {
      throw new PaymentError('configuration', 'LEMON_SQUEEZY_STORE_ID is not configured in the environment variables.');
    }

    const checkout = await createCheckout(storeId, variantIdNumber, {
      checkoutOptions: {
        embed,
        media: true,
        logo: !embed,
        discount: true,
        dark: false,
      },
      checkoutData: {
        email: user.email || undefined,
        name: user.name || undefined,
        custom: {
          user_id: user.id,
        },
      },
      productOptions: {
        enabledVariants: [variantIdNumber],
        redirectUrl: `${process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL}/api/lemon-squeezy/checkout?success=true`,
        receiptLinkUrl: `${process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        receiptButtonText: 'Go to Dashboard',
        receiptThankYouNote: 'Thank you for subscribing to SkillIelts!',
      },
    });

    // Check checkout result
    if (!checkout?.data?.data?.attributes?.url) {
      throw new PaymentError('api-response', 'Failed to retrieve checkout URL from Lemon Squeezy API');
    }

    // Log only in development environment
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Checkout URL created', { url: checkout.data.data.attributes.url });
    }

    return checkout.data.data.attributes.url;
  } catch (error) {
    // Handle specific errors
    if (error instanceof PaymentError) {
      const paymentError = error as PaymentError;
      logger.error(`Payment error (${paymentError.code})`, paymentError);
      throw paymentError;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error creating checkout URL: ${errorMessage}`);
    throw new PaymentError('unknown', `Unable to create checkout: ${errorMessage}`);
  }
}

/**
 * Server action to handle checkout from form submission
 */
export async function checkoutAction(formData: FormData) {
  const user = await currentUser();

  if (!user) {
    return { success: false, error: 'You need to login to continue' };
  }

  const variantId = formData.get('variantId') as string;

  if (!variantId) {
    return { success: false, error: 'Missing variant ID' };
  }
  
  try {
    const checkoutUrl = await getCheckoutURL(variantId);
    if (checkoutUrl) {
      return { success: true, url: checkoutUrl };
    } else {
      return { success: false, error: 'Unable to create checkout URL' };
    }
  } catch (error) {
    const errorMessage = error instanceof PaymentError 
      ? `${error.message} (${error.code})`
      : error instanceof Error 
        ? error.message 
        : 'An unknown error occurred';
        
    logger.error(`Error in checkout action: ${errorMessage}`);
    
    return { 
      success: false, 
      error: `Unable to create checkout: ${errorMessage}` 
    };
  }
}






