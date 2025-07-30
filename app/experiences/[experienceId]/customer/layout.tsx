import type React from 'react';

import { verifyUser } from '@/lib/authentication';
import CustomerHeader from './components/customer-header';

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
      <CustomerHeader experienceId={experienceId} accessLevel={accessLevel} />

      {/* Main Content */}
      <main className='p-8'>{children}</main>
    </div>
  );
}
