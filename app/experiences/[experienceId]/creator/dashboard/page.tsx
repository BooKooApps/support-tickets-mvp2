import { Suspense } from 'react';
import { DashboardStats } from '@/app/experiences/[experienceId]/creator/components/dashboard-stats';
import { ReviewsSection } from '@/app/experiences/[experienceId]/creator/components/reviews-section';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreatorDashboardPage() {
  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold '>Dashboard</h1>
        <p className='text-muted-foreground mt-2'>
          Overview of your support performance and customer feedback
        </p>
      </div>

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <Suspense fallback={<ReviewsSectionSkeleton />}>
        <ReviewsSection />
      </Suspense>
    </div>
  );
}

function DashboardStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {[...Array(4)].map((_, i) => (
        <div key={i} className='bg-white p-6 rounded-lg shadow'>
          <Skeleton className='h-4 w-24 mb-2' />
          <Skeleton className='h-8 w-16 mb-1' />
          <Skeleton className='h-3 w-20' />
        </div>
      ))}
    </div>
  );
}

function ReviewsSectionSkeleton() {
  return (
    <div className='bg-white p-6 rounded-lg shadow'>
      <Skeleton className='h-6 w-48 mb-4' />
      <div className='space-y-4'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='border-b pb-4'>
            <Skeleton className='h-4 w-32 mb-2' />
            <Skeleton className='h-4 w-full mb-1' />
            <Skeleton className='h-4 w-3/4' />
          </div>
        ))}
      </div>
    </div>
  );
}
