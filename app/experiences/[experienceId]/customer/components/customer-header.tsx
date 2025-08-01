'use client';
import React from 'react';
import Link from 'next/link';
import { Ticket, Star, Trophy, Settings2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

const CustomerHeader = ({
  experienceId,
  accessLevel,
}: {
  experienceId: string;
  accessLevel: 'admin' | 'customer';
}) => {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  return (
    <header className='bg-background'>
      <div className='flex items-center justify-between px-6 py-2'>
        <div className='flex gap-2'>
          <Link href={`/experiences/${experienceId}/customer?tab=TICKETS`}>
            <Button
              disabled={tab === 'TICKETS'}
              variant={tab === 'TICKETS' ? 'default' : 'ghost'}
              className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
            >
              <Ticket className='h-4 w-4' />
              {accessLevel === 'admin' ? 'All Tickets' : 'Your Tickets'}
            </Button>
          </Link>
          <Link href={`/experiences/${experienceId}/customer?tab=REVIEWS`}>
            <Button
              disabled={tab === 'REVIEWS'}
              variant={tab === 'REVIEWS' ? 'default' : 'ghost'}
              className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
            >
              <Star className='h-4 w-4' />
              Current Whop Reviews
            </Button>
          </Link>
          <Link href={`/experiences/${experienceId}/customer?tab=LEADBOARD`}>
            <Button
              variant={tab === 'LEADBOARD' ? 'default' : 'ghost'}
              className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
            >
              <Trophy className='h-4 w-4' />
              General Whop Leadboard
            </Button>
          </Link>
          {accessLevel === 'admin' && (
            <Link href={`/experiences/${experienceId}/customer?tab=SETTINGS`}>
              <Button
                variant={tab === 'SETTINGS' ? 'default' : 'ghost'}
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
