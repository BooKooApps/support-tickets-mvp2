'use client';

import type React from 'react';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser } from '@/hooks/use-user';
import { Badge } from '@/components/ui/badge';

export default function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { experienceId: string };
}) {
  const { experienceId } = params;

  const { user, loading, error } = useUser(experienceId);

  return (
    <div className='min-h-screen mx-auto'>
      {/* Header */}
      <header className='bg-background'>
        <div className='flex items-center justify-between p-4'>
          {user?.accessLevel === 'admin' && (
            <Link
              href={`/experiences/${experienceId}/creator`}
              className='flex w- items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted'
            >
              <Settings className='h-4 w-4' />
              Admin Dashboard
            </Link>
          )}

          <div className='flex items-center gap-2'>
            <Badge variant='outline'>
              <span className='text-xs'>{user?.accessLevel}</span>
            </Badge>
            <div className=''>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='p-8'>{children}</main>
    </div>
  );
}
