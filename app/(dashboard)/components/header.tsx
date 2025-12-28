'use client';

//import Link from 'next/link';
import ProgressLink from '@/app/(dashboard)/dashboard/ProgressLink';
import RouteProgress from '@/app/(dashboard)/dashboard/RouteProgress';
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

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  isTwoFactorEnabled?: boolean;
  isOAuth?: boolean;
}

export function Header({ user }: { user: User | null | undefined }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <RouteProgress />
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <ProgressLink href="/" passHref>
            <Logo className="flex items-center" size={48} />
          </ProgressLink>
          <div className="flex items-center space-x-4">
            <ProgressLink href="/pricing" passHref>
              <p className="text-sm font-medium text-gray-700 hover:text-gray-900">Pricing</p>
            </ProgressLink>
            <ProgressLink href="/contact-us" passHref>
              <p className="text-sm font-medium text-gray-700 hover:text-gray-900">Contact Us</p>
            </ProgressLink>
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
                    <ProgressLink href="/dashboard" passHref>
                      <Home className="mr-2 h-4 w-4" />
                      <p className="cursor-pointer">Dashboard</p>
                    </ProgressLink>
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
                <Button className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full">
                  Sign in
                </Button>
              </LoginButton>
            )}
          </div>
        </div>
      </header>
    </>
  );
}






