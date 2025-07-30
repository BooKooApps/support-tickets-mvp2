'use client';

import { useEffect, useState } from 'react';
import { CustomerTicketCard } from './customer-ticket-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Ticket, Category } from '@prisma/client';
import { CustomerTicketsSkeleton } from '../page';

type TicketWithRelations = Ticket & {
  category: Category;
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    ticketId: string;
    senderId: string;
  }>;
  _count: {
    messages: number;
  };
};

interface CustomerTicketsProps {
  experienceId: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function CustomerTickets({
  experienceId,
  currentPage,
  onPageChange,
}: CustomerTicketsProps) {
  const [tickets, setTickets] = useState<TicketWithRelations[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/tickets?experienceId=${experienceId}&page=${currentPage}&limit=3`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        setTickets(data.tickets);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [experienceId, currentPage]);

  if (loading) {
    return <CustomerTicketsSkeleton />;
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <div className='text-red-500 text-lg mb-2'>Error loading tickets</div>
        <div className='text-gray-500 text-sm'>{error}</div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className=' text-lg mb-2'>No support tickets yet</div>
        <div className='text-muted-foreground text-sm'>
          Click "Create Ticket" above to get started
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        {tickets.map(ticket => (
          <CustomerTicketCard key={ticket.id} ticket={ticket} />
        ))}
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
}
