import { Suspense } from 'react';
import { SettingsForm } from '@/app/experiences/[experienceId]/creator/components/settings-form';
import { CategoriesManager } from '@/app/experiences/[experienceId]/creator/components/categories-manager';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreatorSettingsPage({
  params,
}: {
  params: { experienceId: string };
}) {
  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold '>Settings</h1>
        <p className='text-muted-foreground mt-2'>
          Customize your support experience and manage categories
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <Suspense fallback={<SettingsFormSkeleton />}>
          <SettingsForm experienceId={params.experienceId} />
        </Suspense>

        <Suspense fallback={<CategoriesManagerSkeleton />}>
          <CategoriesManager experienceId={params.experienceId} />
        </Suspense>
      </div>
    </div>
  );
}

function SettingsFormSkeleton() {
  return (
    <div className='bg-white p-6 rounded-lg shadow space-y-4'>
      <Skeleton className='h-6 w-48' />
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-10 w-24' />
    </div>
  );
}

function CategoriesManagerSkeleton() {
  return (
    <div className='bg-white p-6 rounded-lg shadow space-y-4'>
      <Skeleton className='h-6 w-48' />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className='flex items-center justify-between p-3 border rounded'
        >
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-4 rounded-full' />
            <Skeleton className='h-4 w-24' />
          </div>
          <Skeleton className='h-8 w-16' />
        </div>
      ))}
    </div>
  );
}
