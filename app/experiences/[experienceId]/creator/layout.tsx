'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Ticket,
  BarChart3,
  Settings,
  Bell,
  Home,
  User,
  Users,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser } from '@/hooks/use-user';

export default function CreatorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { experienceId: string };
}) {
  const { experienceId } = params;
  const navigation = [
    {
      name: 'Open Tickets',
      href: `/experiences/${experienceId}/creator`,
      icon: Ticket,
    },
    {
      name: 'Dashboard',
      href: `/experiences/${experienceId}/creator/dashboard`,
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: `/experiences/${experienceId}/creator/settings`,
      icon: Settings,
    },
  ];

  const { user, loading, error } = useUser(experienceId, 'admin');

  const pathname = usePathname();
  const [notifications] = useState(3); // Mock notification count

  return (
    <div className='min-h-screen  mx-auto'>
      <div className='flex'>
        {/* Sidebar */}
        <aside className='w-64 min-h-screen border-r bg-background'>
          <div className='p-6 space-y-6'>
            {/* Logo and Brand */}
            <div className='space-y-4'></div>

            {/* Navigation */}
            <nav className='space-y-2'>
              {/* Return to Customer View */}

              <div className='pt-4 border-b'>
                <Link
                  href={`/experiences/${experienceId}/customer`}
                  className='flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted'
                >
                  <Users className='h-4 w-4' />
                  Customer View
                </Link>
              </div>
              <div className='pb-4 border-b'>
                <ThemeToggle />
                <span className='flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted'>
                  <User className='h-4 w-4' />
                  {loading ? (
                    <span className='animate-pulse text-xs text-muted-foreground'>
                      Loading...
                    </span>
                  ) : (
                    user?.username || (
                      <span className='text-xs text-muted-foreground'>
                        Unknown User
                      </span>
                    )
                  )}
                </span>
              </div>

              {navigation.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className='h-4 w-4' />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-8'>{children}</main>
      </div>
    </div>
  );
}
