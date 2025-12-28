'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import LoginButton from '@/components/auth/login-button';
import { LogoutButton } from '@/components/auth/logout-button';
import { useSession } from 'next-auth/react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  
  // Don't show header on dashboard routes (dashboard has its own header)
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <Logo className="flex items-center" size={48} />
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/pricing">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Pricing
            </p>
          </Link>
          <Link href="/contact-us">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Contact Us
            </p>
          </Link>
          {user ? (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer size-9">
                  <AvatarImage
                    alt={user?.name || ''}
                    src={user?.image || ''}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="bg-green-500 text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <p className="cursor-pointer">Dashboard</p>
                  </Link>
                </DropdownMenuItem>
                <LogoutButton>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </LogoutButton>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginButton mode="modal" asChild>
              <Button className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black text-sm px-4 py-2 rounded-full">
                Sign in
              </Button>
            </LoginButton>
          )}
        </div>
      </div>
    </header>
  );
}

