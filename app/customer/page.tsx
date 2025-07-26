import { Suspense } from 'react';
import { CustomerTickets } from '@/components/customer/customer-tickets';
import { CreateTicketButton } from '@/components/customer/create-ticket-button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerPortalPage() {
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-3xl font-bold '>Support Tickets</h1>
          <p className='text-muted-foreground mt-2'>
            View your support requests and get help from our team
          </p>
        </div>
        <CreateTicketButton />
      </div>

      <Suspense fallback={<CustomerTicketsSkeleton />}>
        <CustomerTickets />
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
