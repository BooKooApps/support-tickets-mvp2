'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getTimeAgo } from '@/lib/utils';
import { MessageCircle, Clock, User } from 'lucide-react';
import { TicketChat } from './ticket-chat';

interface TicketCardProps {
  ticket: any; // In production, create proper TypeScript types
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/claim`, {
        method: 'POST',
      });
      if (response.ok) {
        window.location.reload(); // In production, use proper state management
      }
    } catch (error) {
      console.error('Failed to claim ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/close`, {
        method: 'POST',
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to close ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColor = {
    OPEN: 'bg-red-100 text-red-800',
    CLAIMED: 'bg-yellow-100 text-yellow-800',
    CLOSED: 'bg-green-100 text-green-800',
  };

  const priorityColor = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <h3 className='font-semibold text-lg'>{ticket.title}</h3>
              <Badge className={statusColor[ticket.status]}>
                {ticket.status}
              </Badge>
              <Badge
                variant='outline'
                className={priorityColor[ticket.priority]}
              >
                {ticket.priority}
              </Badge>
            </div>
            <div className='flex items-center gap-4 text-sm text-gray-500'>
              <div className='flex items-center gap-1'>
                <User className='h-4 w-4' />
                {ticket.creator.name}
              </div>
              <div className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                {getTimeAgo(new Date(ticket.createdAt))}
              </div>
              <div className='flex items-center gap-1'>
                <MessageCircle className='h-4 w-4' />
                {ticket._count.messages} messages
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {ticket.status === 'OPEN' && (
              <Button size='sm' onClick={handleClaim} disabled={isLoading}>
                Claim Ticket
              </Button>
            )}
            {ticket.status === 'CLAIMED' && (
              <Button
                size='sm'
                variant='outline'
                onClick={handleClose}
                disabled={isLoading}
              >
                Close Ticket
              </Button>
            )}
            <Button
              size='sm'
              variant='ghost'
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'View Chat'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className='space-y-4'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Badge
                variant='outline'
                style={{
                  backgroundColor: ticket.category.color + '20',
                  color: ticket.category.color,
                }}
              >
                {ticket.category.name}
              </Badge>
            </div>
            <p className='text-gray-600'>{ticket.description}</p>
          </div>

          {ticket.messages.length > 0 && (
            <div className='border-t pt-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Avatar className='h-6 w-6'>
                  <AvatarFallback className='text-xs'>
                    {ticket.messages[0].sender.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className='text-sm font-medium'>
                  {ticket.messages[0].sender.name}
                </span>
                <span className='text-xs text-gray-500'>
                  {getTimeAgo(new Date(ticket.messages[0].createdAt))}
                </span>
              </div>
              <p className='text-sm text-gray-600 line-clamp-2'>
                {ticket.messages[0].content}
              </p>
            </div>
          )}

          {isExpanded && (
            <div className='border-t pt-4'>
              <TicketChat ticketId={ticket.id} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
