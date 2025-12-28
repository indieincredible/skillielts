import { getLemonSqueezyPrices } from '@/lib/payments/lemon-squeezy';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Cache for 5 minutes to balance API limits with data freshness
export const revalidate = 300;
/**
 * GET endpoint to get pricing information from LemonSqueezy
 * This endpoint uses revalidate to ensure data is always up to date
 */
export async function GET() {
  try {
    logger.info('Fetching pricing data from LemonSqueezy API');

    // Get data from LemonSqueezy with no cache
    const prices = await getLemonSqueezyPrices(0);

    // Log success and number of prices received
    logger.info(`Successfully fetched ${prices.length} pricing variants`);

    // Return data as JSON
    return NextResponse.json({
      prices,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Log error if any
    logger.error('Error fetching pricing data:', error as Error);

    // Return error 500 with error message
    return NextResponse.json({ error: 'Failed to fetch pricing data' }, { status: 500 });
  }
}






