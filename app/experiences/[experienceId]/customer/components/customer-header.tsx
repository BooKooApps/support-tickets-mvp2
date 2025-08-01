'use client';
import React from 'react';
import Link from 'next/link';
import { Ticket, Star, Trophy, Settings2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

const CustomerHeader = ({
  experienceId,
  accessLevel,
}: {
  experienceId: string;
  accessLevel: 'admin' | 'customer';
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
              {accessLevel === 'admin' ? 'All Tickets' : 'Your Tickets'}
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
          <Link href={`/experiences/${experienceId}/customer/whop-leadboard`}>
            <Button
              variant={
                pathName ===
                `/experiences/${experienceId}/customer/whop-leadboard`
                  ? 'default'
                  : 'ghost'
              }
              className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
            >
              <Trophy className='h-4 w-4' />
              General Whop Leadboard
            </Button>
          </Link>
          {accessLevel === 'admin' && (
            <Link href={`/experiences/${experienceId}/customer/whop-leadboard`}>
              <Button
                variant={
                  pathName ===
                  `/experiences/${experienceId}/customer/whop-leadboard`
                    ? 'default'
                    : 'ghost'
                }
                className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
              >
                <Settings2 className='h-4 w-4' />
                Admin Settings
              </Button>
            </Link>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
