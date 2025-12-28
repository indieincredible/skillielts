'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { getItemWithTTL } from '@/lib/localStorage-utils';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check callbackUrl after successful login
    if (session && status === 'authenticated') {
      const callbackUrl = getItemWithTTL<string>('loginCallbackUrl');
      if (callbackUrl) {
        logger.info('🔍 Found callbackUrl in localStorage:', { callbackUrl });
        localStorage.removeItem('loginCallbackUrl'); // Remove after use
        router.push(callbackUrl);
      }
    }
  }, [session, status, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" />
      {children}
    </QueryClientProvider>
  );
}






