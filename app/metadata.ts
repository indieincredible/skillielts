import { Metadata } from 'next';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'SkillIelts',
  description: 'Test your English skills and get AI-powered feedback',
  openGraph: {
    title: 'SkillIelts',
    description: 'Test your English skills and get AI-powered feedback',
    url: baseUrl,
    siteName: 'SkillIelts',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: 'SkillIelts',
    description: 'Test your English skills and get AI-powered feedback',
    card: 'summary_large_image',
  },
};






