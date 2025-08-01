'use client';

import { useEffect, useState } from 'react';
import { useOnWebsocketMessage } from '@whop/react';
import { Loader2, Ticket as TicketIcon } from 'lucide-react';
import { CreateTicketDialog } from './create-ticket-dialog';
import { Ticket, Category, Message } from '@prisma/client';
import CustomerTicketList from './customer-ticket-list';
import { EmptyTicketState } from '@/components/empty-ticket-state';
import { ErrorTicketState } from '@/components/error-ticket-state';

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
  companyId: string;
  ticketId?: string;
}

export function CustomerTickets({
  experienceId,
  accessLevel,
  companyId,
}: {
  experienceId: string;
  accessLevel: 'admin' | 'customer';
  companyId: string;
}) {
  const [tickets, setTickets] = useState<TicketWithRelations[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTicketsCount, setNewTicketsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTickets = async () => {
    try {
      const url =
        accessLevel === 'admin' ? '/api/tickets/creator' : '/api/tickets';
      setIsLoading(true);
      const response = await fetch(
        `${url}?experienceId=${experienceId}&page=${currentPage}&limit=3`
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

        // only handle messages for the current company
        if (websocketMessage.companyId !== companyId) {
          return;
        }

        // if the message does not have data, return
        if (!websocketMessage.data) {
          return;
        }

        switch (websocketMessage.type) {
          case 'NEW_TICKET':
            // refresh the current data (only for admin)
            if (accessLevel !== 'admin') {
              return;
            }

            setNewTicketsCount(prev => prev + 1);
            if (tickets.length > 2) {
              fetchTickets();
            }

            if (tickets.length <= 2) {
              setTickets(prev => [websocketMessage.data, ...prev]);
            }

            break;

          case 'TICKET_CLAIMED':
            // refresh the current data for both admin and customer
            if (tickets.length > 2) {
              fetchTickets();
            }

            if (tickets.length <= 2) {
              setTickets(prev => [websocketMessage.data, ...prev]);
            }

            break;
          case 'TICKET_CLOSED':
            // refresh the current data for both admin and customer
            if (tickets.length > 2) {
              fetchTickets();
            }

            if (tickets.length <= 2) {
              setTickets(prev => [websocketMessage.data, ...prev]);
            }
            break;
          default:
            break;
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
    return <ErrorTicketState error={error} />;
  }

  return (
    <>
      {RenderHeader({
        accessLevel,
        newTicketsCount,
        handleClickNewTicketWarning,
        fetchTickets,
        experienceId,
        setTickets,
        tickets,
      })}

      {isLoading && tickets.length === 0 ? (
        <div className='flex justify-center items-center h-full'>
          <Loader2 className='h-4 w-4 animate-spin text-primary' />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyTicketState />
      ) : (
        <CustomerTicketList
          experienceId={experienceId}
          accessLevel={accessLevel}
          isLoading={isLoading}
          tickets={tickets}
          setTickets={setTickets}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}

const RenderHeader = ({
  accessLevel,
  newTicketsCount,
  handleClickNewTicketWarning,
  setTickets,
  fetchTickets,
  tickets,
  experienceId,
}: {
  accessLevel: 'admin' | 'customer';
  newTicketsCount: number;
  handleClickNewTicketWarning: () => void;
  setTickets: React.Dispatch<React.SetStateAction<TicketWithRelations[]>>;
  fetchTickets: () => void;
  tickets: TicketWithRelations[];
  experienceId: string;
}) => {
  if (accessLevel === 'admin') {
    return (
      <div className='flex justify-between items-start'>
        <div className='flex items-center w-full justify-between'>
          <div className='flex items-center gap-2'>
            <TicketIcon className='h-5 w-5 ' />
            <h1 className='text-xl font-bold '>Open Tickets</h1>
            <span className='text-xs text-primary'>
              {/* number of open tickets */}
              {tickets.filter(ticket => ticket.status === 'OPEN').length} open
            </span>
          </div>

          {newTicketsCount > 0 && (
            <span
              className='text-sm text-primary animate-pulse cursor-pointer'
              onClick={handleClickNewTicketWarning}
            >
              {newTicketsCount} new tickets !
            </span>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className='flex justify-between items-start'>
      <div className='flex items-center gap-2'>
        <TicketIcon className='h-5 w-5 ' />
        <h1 className='text-xl font-bold '>View your tickets</h1>
      </div>
      <CreateTicketDialog
        experienceId={experienceId}
        setTickets={setTickets}
        tickets={tickets}
        fetchTickets={fetchTickets}
      />
    </div>
  );
};
