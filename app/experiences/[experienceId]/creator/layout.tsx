import type React from 'react';
import { CreatorSidebar } from '@/app/experiences/[experienceId]/creator/components/creator-sidebar';

export default async function CreatorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;

  return (
    <div className='min-h-screen mx-auto flex flex-col'>
      <CreatorSidebar experienceId={experienceId} />

      {/* Main Content */}
      <main className='flex-1 p-8'>{children}</main>
    </div>
  );
}
