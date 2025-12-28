'use server';

import { logger } from '@/lib/logger';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { PaymentError } from '@/lib/payments/errors';
import { getUserSubscription } from '@/lib/payments/subscription';
import { getCustomerPortalURL } from '@/lib/payments/lemon-squeezy';

/**
 * Server action to create customer portal session
 * @returns Object containing customer portal URL or error
 */
export async function customerPortalAction() {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/auth/login');
    }

    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      logger.error(`User not found in database for customer portal. User ID: ${user.id}`);
      throw new PaymentError('user-not-found', 'User not found in database');
    }
    
    
    if (!dbUser.lemonSqueezyCustomerId) {
      logger.warn(`No LemonSqueezy customer ID found for user: ${dbUser.id}`);
      throw new PaymentError('customer-portal-error', 'No LemonSqueezy customer ID found for this user');
    }

    try {
      // Get subscription from database first
      const subscription = await getUserSubscription(dbUser.id);
      
      // Create customer portal session
      const portalUrl = await getCustomerPortalURL(dbUser.id);
      
      if (!portalUrl) {
        throw new PaymentError('api-response', 'Invalid response from Lemon Squeezy API');
      }
      
      logger.info(`Customer portal URL created successfully for user: ${dbUser.id}`);
      return { url: portalUrl };
    } catch (error) {
      logger.error('LemonSqueezy portal error', error instanceof Error ? error : new Error('Unknown error'));
      throw new PaymentError(
        'customer-portal-error',
        `Failed to create LemonSqueezy portal: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  } catch (error) {
    if (error instanceof PaymentError) {
      logger.error(`Payment error (${error.code})`, error);
      throw error;
    }
    
    logger.error('Failed to create customer portal session', error instanceof Error ? error : new Error('Unknown error'));
    throw new PaymentError('unknown', 'Failed to create customer portal session. Please try again later.');
  }
}






