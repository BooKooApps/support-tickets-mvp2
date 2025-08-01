'use client';

import { useEffect, useState } from 'react';
import { useOnWebsocketMessage } from '@whop/react';
import { Loader2, Ticket as TicketIcon } from 'lucide-react';
import { CreateTicketDialog } from './create-ticket-dialog';
import { Ticket, Category, Message } from '@prisma/client';
import CustomerTicketList from './customer-ticket-list';

export type TicketWithRelations = Ticket & {
  category: Category;
  creator: {
    username: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
  messages: Message[];
  _count: {
    messages: number;
  };
};

interface WebsocketMessage {
  type: string;
  data: TicketWithRelations;
  ticketId?: string;
}

export function CustomerTickets({ experienceId }: { experienceId: string }) {
  const [tickets, setTickets] = useState<TicketWithRelations[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTicketsCount, setNewTicketsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // Listen for WebSocket messages
  useOnWebsocketMessage(message => {
    if (message.isTrusted) {
      try {
        const websocketMessage: WebsocketMessage = JSON.parse(message.json);

        // Handle new ticket creation - refresh current data
        if (websocketMessage.type === 'NEW_TICKET' && websocketMessage.data) {
          setNewTicketsCount(prev => prev + 1);
          fetchTickets();
        }
      } catch (error) {
        console.error('Failed to parse websocket message:', error);
      }
    }
  });

  const handleClickNewTicketWarning = () => {
    setNewTicketsCount(0);
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [experienceId, currentPage]);

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      <div className='flex justify-between items-start'>
        <div className='flex items-center gap-2'>
          <TicketIcon className='h-5 w-5 ' />
          <h1 className='text-xl font-bold '>View your tickets</h1>
          {newTicketsCount > 0 && (
            <span
              className='text-xs text-primary animate-pulse cursor-pointer'
              onClick={handleClickNewTicketWarning}
            >
              {newTicketsCount} new tickets !
            </span>
          )}
        </div>
        <CreateTicketDialog experienceId={experienceId} />
      </div>

      {isLoading && tickets.length === 0 ? (
        <div className='flex justify-center items-center h-full'>
          <Loader2 className='h-4 w-4 animate-spin text-primary' />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState />
      ) : (
        <CustomerTicketList
          isLoading={isLoading}
          tickets={tickets}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}

const EmptyState = () => {
  return (
    <div className='text-center py-12'>
      <div className=' text-lg mb-2'>No support tickets yet</div>
      <div className='text-muted-foreground text-sm'>
        Click "Create Ticket" above to get started
      </div>
    </div>
  );
};

const ErrorState = ({ error }: { error: string }) => {
  return (
    <div className='text-center py-12'>
      <div className='text-destructive text-lg mb-2'>Error loading tickets</div>
      <div className='text-muted-foreground text-sm'>{error}</div>
    </div>
  );
};
