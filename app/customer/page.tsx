import { Suspense } from 'react';
import { CustomerTickets } from '@/app/experiences/[experienceId]/customer/components/customer-tickets';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateTicketDialog } from '../experiences/[experienceId]/customer/components/create-ticket-dialog';

export default function CustomerPortalPage({
  params,
}: {
  params: { experienceId: string };
}) {
  const { experienceId } = params;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-xl font-bold '>View your support tickets</h1>
        </div>
        <CreateTicketDialog experienceId={experienceId} />
      </div>

      <Suspense fallback={<CustomerTicketsSkeleton />}>
        <CustomerTickets experienceId={experienceId} />
      </Suspense>
    </div>
  );
}

function CustomerTicketsSkeleton() {
  return (
    <div className='space-y-4'>
      {[...Array(2)].map((_, i) => (
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
