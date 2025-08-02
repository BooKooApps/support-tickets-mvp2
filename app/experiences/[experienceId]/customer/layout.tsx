import type React from 'react';

import { verifyUser } from '@/lib/authentication';
import AppSidebar from './components/app-sidebar';

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
    </div>
  );
}
