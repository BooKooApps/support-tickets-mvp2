'use client';
import React from 'react';
import Link from 'next/link';
import { Ticket, Star, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

const CustomerHeader = ({
  experienceId,
  accessLevel,
}: {
  experienceId: string;
  accessLevel: string;
}) => {
  const pathName = usePathname();

  return (
    <header className='bg-background'>
      <div className='flex items-center justify-between px-6 py-2'>
        <div className='flex gap-2'>
          <Link href={`/experiences/${experienceId}/customer`}>
            <Button
              disabled={pathName === `/experiences/${experienceId}/customer`}
              variant={
                pathName === `/experiences/${experienceId}/customer`
                  ? 'default'
                  : 'ghost'
              }
              className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
            >
              <Ticket className='h-4 w-4' />
              Your Tickets
            </Button>
          </Link>
          <Link href={`/experiences/${experienceId}/customer/reviews`}>
            <Button
              disabled={
                pathName === `/experiences/${experienceId}/customer/reviews`
              }
              variant={
                pathName === `/experiences/${experienceId}/customer/reviews`
                  ? 'default'
                  : 'ghost'
              }
              className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
            >
              <Star className='h-4 w-4' />
              Current Whop Reviews
            </Button>
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <div>
            <ThemeToggle />
          </div>
          {accessLevel === 'admin' && (
            <Link
              href={`/experiences/${experienceId}/creator`}
              className='flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted'
            >
              <Settings className='h-4 w-4' />
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
