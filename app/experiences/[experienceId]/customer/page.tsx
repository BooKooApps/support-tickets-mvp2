'use client';

import { Suspense, useEffect, useState } from 'react';
import { CustomerTickets } from '@/app/experiences/[experienceId]/customer/components/customer-tickets';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateTicketDialog } from './components/create-ticket-dialog';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function CustomerPortalPage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const [experienceId, setExperienceId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    params.then(({ experienceId }) => {
      setExperienceId(experienceId);
    });
  }, [params]);

  useEffect(() => {
    const page = searchParams.get('page');
    if (page) {
      setCurrentPage(parseInt(page));
    }
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!experienceId) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-start'>
        <div className='flex items-center gap-2'>
          <Ticket className='h-5 w-5 ' />
          <h1 className='text-xl font-bold '>View your tickets</h1>
        </div>
        <CreateTicketDialog experienceId={experienceId} />
      </div>

      <Suspense fallback={<CustomerTicketsSkeleton />}>
        <CustomerTickets
          experienceId={experienceId}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </Suspense>
    </div>
  );
}

export function CustomerTicketsSkeleton() {
  return (
    <div className='space-y-4'>
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-6 w-20' />
            </div>
            <Skeleton className='h-4 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-3/4' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
