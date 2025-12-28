import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import authConfig from '@/auth.config';

import { UserRole } from '@/types';
import { getUserById } from '@/data/user';
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation';
import { db } from '@/lib/db';
import { getAccountByUserId } from './data/account';
import { logger } from '@/lib/logger';

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true;

      if (!user.id) return false;

      const existingUser = await getUserById(user.id);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as 'ADMIN' | 'USER';
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        session.user.name = token.name || '';
        session.user.email = token.email || '';
        session.user.isOAuth = token.isOAuth as boolean;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    },
    async redirect({ url, baseUrl }) {
      // Ensure that in development environment, we use http
      // Check if URL contains facebook callback
      if (url.includes('/api/auth/callback/facebook')) {
        if (process.env.NODE_ENV === 'development') {
          // Ensure conversion from HTTPS to HTTP for localhost
          return url.replace('https://localhost', 'http://localhost');
        }
      }
      
      // If URL starts with baseUrl, keep it (including callbackUrl)
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // For other cases, check and convert from HTTPS to HTTP
      if (process.env.NODE_ENV === 'development' && url.includes('https://localhost')) {
        return url.replace('https://localhost', 'http://localhost');
      }
      
      // If no specific URL, redirect to home page
      logger.info('🏠 Redirecting to home page');
      return `${baseUrl}/`;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
});
