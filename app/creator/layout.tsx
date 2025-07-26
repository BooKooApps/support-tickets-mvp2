'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, BarChart3, Settings, Bell, Home, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const navigation = [
  { name: 'Open Tickets', href: '/creator', icon: Ticket },
  { name: 'Dashboard', href: '/creator/dashboard', icon: BarChart3 },
  { name: 'Settings', href: '/creator/settings', icon: Settings },
];

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [notifications] = useState(3); // Mock notification count

  return (
    <div className='min-h-screen  mx-auto'>
      <div className='flex'>
        {/* Sidebar */}
        <aside className='w-64 min-h-screen border-r bg-background'>
          <div className='p-6 space-y-6'>
            {/* Logo and Brand */}
            <div className='space-y-4'>
              <Link href='/' className='flex items-center gap-2'>
                <Home className='h-5 w-5' />
                <span className='font-semibold'>Support Tickets</span>
              </Link>
              <Badge variant='secondary'>Creator</Badge>
            </div>

            {/* Navigation */}
            <nav className='space-y-2'>
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

            {/* User Section */}
            <div className='pt-6 border-t space-y-4'>
              <div className='flex items-center gap-2'>
                <User className='h-4 w-4' />
                <span className='text-sm font-medium'>John Creator</span>
              </div>

              <Button
                variant='ghost'
                size='sm'
                className='relative w-full justify-start'
              >
                <Bell className='h-4 w-4 mr-2' />
                <span className='text-sm'>Notifications</span>
                {notifications > 0 && (
                  <Badge
                    variant='destructive'
                    className='ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs'
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>

              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-8'>{children}</main>
      </div>
    </div>
  );
}
