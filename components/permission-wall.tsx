'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

interface PermissionWallProps {
  children: React.ReactNode;
  experienceId: string;
}

const PermissionWall = ({ children, experienceId }: PermissionWallProps) => {
  const router = useRouter();
  const { user, loading, error } = useUser(experienceId, 'admin');

  useEffect(() => {
    if (!loading && !user) {
      // If not loading and no user (meaning not admin), redirect to customer page
      router.push(`/experiences/${experienceId}/customer?tab=TICKETS`);
    }
  }, [user, loading, error, experienceId, router]);

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
        </div>
      </div>
    );
  }

  // If there's an error or user is not admin, don't render children
  if (error || !user) {
    return null;
  }

  // If user is admin, render children
  return <>{children}</>;
};

export default PermissionWall;
