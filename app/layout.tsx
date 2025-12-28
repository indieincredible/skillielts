import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { metadata as baseMetadata } from './metadata';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { auth } from '@/auth';
import Providers from './providers';
import Footer from '@/components/footer/Footer';
import { Header } from '@/components/header';

const manrope = Manrope({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'SkillIelts - English Skills Assessment Platform',
  description:
    'Real-time English skills assessment through timed quizzes. Supporting companies in recruitment and candidates in self-evaluation.',
  keywords: 'english skills assessment, ielts test, english recruitment, skill evaluation, english quiz',
  authors: [{ name: 'SkillIelts Team' }],
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'SkillIelts - English Skills Assessment Platform',
    description:
      'Real-time English skills assessment through timed quizzes. Supporting companies in recruitment and candidates in self-evaluation.',
    url: 'https://skillielts.dev',
    siteName: 'SkillIelts',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SkillIelts - English Skills Assessment',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    ...baseMetadata.twitter,
    card: 'summary_large_image',
    title: 'SkillIelts - English Skills Assessment Platform',
    description: 'Real-time English skills assessment through timed quizzes.',
    images: ['/og-image.jpg'],
  },
  robots: 'index, follow',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // 5 minutes instead of 1 minute default
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className} flex flex-col min-h-screen`}
        >
          <Providers>
            <Header />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </Providers>
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </SessionProvider>
  );
}






