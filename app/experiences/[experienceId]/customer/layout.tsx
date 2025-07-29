import type React from 'react';

import Link from 'next/link';
import { Ticket, Star, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { verifyUser } from '@/lib/authentication';

export default async function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;

  const { userId, username, accessLevel } = await verifyUser(experienceId);

  return (
    <div className='min-h-screen mx-auto'>
      {/* Header */}
      <header className='bg-background'>
        <div className='flex items-center justify-between px-6 py-2'>
          <div className='flex gap-2'>
            <Link href={`/experiences/${experienceId}/customer`}>
              <Button
                variant='ghost'
                className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
              >
                <Ticket className='h-4 w-4' />
                Your Tickets
              </Button>
            </Link>
            <Link href={`/experiences/${experienceId}/customer/reviews`}>
              <Button
                variant='ghost'
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

      {/* Main Content */}
      <main className='p-8'>{children}</main>
    </div>
  );
}
