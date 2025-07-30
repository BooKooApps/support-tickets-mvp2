'use client';

import { useEffect, useState } from 'react';
import { useOnWebsocketMessage } from '@whop/react';
import { TicketCard } from './ticket-card';
import { Ticket, Category } from '@prisma/client';

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

interface WebsocketMessage {
  type: string;
  data: TicketWithRelations;
  ticketId?: string;
}

export function TicketsList({ experienceId }: { experienceId: string }) {
  const [tickets, setTickets] = useState<TicketWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for WebSocket messages
  useOnWebsocketMessage(message => {
    if (message.isTrusted) {
      try {
        const websocketMessage: WebsocketMessage = JSON.parse(message.json);

        // Handle new ticket creation
        if (websocketMessage.type === 'NEW_TICKET' && websocketMessage.data) {
          const newTicket = websocketMessage.data;
          // Only add if it's in the OPEN status (what creators see)
          if (newTicket.status === 'OPEN') {
            setTickets(prev => {
              // Check if ticket already exists to avoid duplicates
              const exists = prev.some(t => t.id === newTicket.id);
              if (exists) return prev;

              // Add new ticket to the beginning
              return [newTicket, ...prev];
            });
          }
        }
      } catch (error) {
        console.error('Failed to parse websocket message:', error);
      }
    }
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        // Use the same API endpoint but for creator view
        const response = await fetch(
          `/api/tickets/creator?experienceId=${experienceId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        setTickets(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [experienceId]);

  if (loading) {
    return (
      <div className='space-y-4'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='h-32 bg-gray-100 rounded-lg animate-pulse' />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <div className='text-destructive text-lg mb-2'>
          Error loading tickets
        </div>
        <div className='text-muted-foreground text-sm'>{error}</div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-gray-400 text-lg mb-2'>No open tickets</div>
        <div className='text-gray-500 text-sm'>
          All caught up! New tickets will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
