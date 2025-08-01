'use client';

import { CustomerTicketCard } from './customer-ticket-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketWithRelations } from './customer-tickets';

const CustomerTicketList = ({
  tickets,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: {
  tickets: TicketWithRelations[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        {isLoading ? (
          <CustomerTicketsSkeleton />
        ) : (
          tickets.map(ticket => (
            <CustomerTicketCard key={ticket.id} ticket={ticket} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className='h-4 w-4' />
            Previous
          </Button>

          <span className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerTicketList;

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
