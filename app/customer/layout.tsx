'use client';

import type React from 'react';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Home, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen  mx-auto'>
      <div className='flex'>
        {/* Header */}
        <aside className='w-64 min-h-screen border-r bg-background'>
          <div className='p-6 space-y-6'>
            <div className='space-y-4'>
              {/* Logo and Brand */}
              <div className='space-y-4'>
                <Link href='/' className='flex items-center gap-2'>
                  <Home className='h-5 w-5' />
                  <span className='font-semibold'>Support Portal</span>
                </Link>
                <Badge variant='secondary'>Customer</Badge>
              </div>

              {/* User Section */}
              <div className='pt-6 border-t space-y-4'>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4' />
                  <span className='text-sm font-medium'>John Customer</span>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </aside>
        <main className='flex-1 p-8'>{children}</main>
      </div>
    </div>
  );
}
