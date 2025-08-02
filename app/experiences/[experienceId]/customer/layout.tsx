import type React from 'react';

import { verifyUser } from '@/lib/authentication';
import AppSidebar from './components/app-sidebar';
import Link from 'next/link';

export default async function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;

  const { accessLevel } = await verifyUser(experienceId);

  return (
    <div className='min-h-screen mx-auto'>
      {/* Header */}
      <AppSidebar experienceId={experienceId} accessLevel={accessLevel} />

      {/* Main Content */}
      <main className='p-8'>{children}</main>

      <Link
        href='https://whop.com/bookooapps'
        target='_blank'
        className='fixed md:block hidden bottom-4 font-light left-1/2 -translate-x-1/2 bg-background  rounded shadow text-sm  z-50 cursor-pointer hover:text-primary hover:text-shadow-2xs transition-all duration-300'
      >
        Powered by BooKoo Apps
      </Link>
    </div>
  );
}
