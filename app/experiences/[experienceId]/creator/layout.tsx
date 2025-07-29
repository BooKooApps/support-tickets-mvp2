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
  ArrowLeft,
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
    <div className='min-h-screen mx-auto flex flex-col'>
      {/* Header */}
      <header className='w-full bg-background px-6 py-2 flex items-center justify-between'>
        {/* Left: Customer View link */}
        <div className='flex items-center gap-4'>
          <Link
            href={`/experiences/${experienceId}/customer`}
            className='flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted'
          >
            <ArrowLeft className='h-4 w-4' />
            Customer View
          </Link>
        </div>

        {/* Middle: Main Navigation */}
        <nav className='flex items-center gap-2'>
          {navigation.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
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

        {/* Right: Theme toggle and user */}
        <div className='flex items-center gap-3'>
          <Badge >Admin View</Badge>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 p-8'>{children}</main>
    </div>
  );
}
