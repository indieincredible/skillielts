import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { configureLemonSqueezy } from '@/lib/config/lemonsqueezy';
import { logger } from '@/lib/logger';

/**
 * Handle redirect after payment
 * Similar to route.ts in /api/stripe/checkout
 */
export async function GET(request: NextRequest) {
  // Ensure SDK is configured
  configureLemonSqueezy();
  try {
    logger.info('Processing Lemon Squeezy checkout redirect');
    // Check if user is logged in
    const user = await currentUser();

    if (!user) {
      logger.warn('User not authenticated for checkout redirect');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check user_id from custom data if available
    const customData = request.nextUrl.searchParams.get('custom');
    if (customData) {
      try {
        logger.info('Parsing custom data from checkout redirect', { customData });
        const parsedData = JSON.parse(decodeURIComponent(customData));
        if (parsedData.user_id && parsedData.user_id === user.id) {
          // Update subscription information from database
          logger.info('User ID matched in custom data', { userId: user.id });
          const dbUser = await db.user.findUnique({ where: { id: user.id } });
          if (dbUser && dbUser.subscriptionStatus === 'active') {
            await db.user.update({
              where: { id: user.id },
              data: { role: 'PREMIUM' },
            });
            return NextResponse.redirect(new URL('/', request.url));
          } else {
            logger.warn('Subscription not active yet or user not found in DB', {
              userId: user.id,
              subscriptionStatus: dbUser?.subscriptionStatus,
            });
          }
        } else {
          logger.warn('User ID mismatch in custom data', {
            customUserId: parsedData.user_id,
            actualUserId: user.id,
          });
        }
      } catch (error) {
        logger.error('Error parsing custom data:', error as Error);
      }
    } else {
      logger.warn('No custom data found in checkout redirect URL');
    }

    // If no custom data or subscription not active yet, redirect to homepage
    logger.info('Redirecting to homepage without role update', { userId: user.id });
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    logger.error('Error processing checkout:', error as Error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}






