'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTimeAgo } from '@/lib/utils';
import { MessageCircle, Clock } from 'lucide-react';
import { ReviewDialog } from './review-dialog';
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

interface CustomerTicketCardProps {
  ticket: TicketWithRelations;
}

export function CustomerTicketCard({ ticket }: CustomerTicketCardProps) {
  const router = useRouter();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/close`, {
        method: 'POST',
      });
      if (response.ok) {
        setShowReviewDialog(true);
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

  const statusText = {
    OPEN: 'Waiting for support',
    CLAIMED: 'Being handled',
    CLOSED: 'Resolved',
  };

  return (
    <>
      <Card className='hover:shadow-md transition-shadow'>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <h3 className='font-semibold text-lg'>{ticket.title}</h3>
                <Badge className={statusColor[ticket.status]}>
                  {statusText[ticket.status]}
                </Badge>
              </div>
              <div className='flex items-center gap-4 text-sm text-gray-500'>
                <div className='flex items-center gap-1'>
                  <Clock className='h-4 w-4' />
                  {getTimeAgo(new Date(ticket.createdAt))}
                </div>
                <div className='flex items-center gap-1'>
                  <MessageCircle className='h-4 w-4' />
                  {ticket._count.messages} messages
                </div>
                {ticket.agentId && (
                  <div className='text-green-600'>
                    Assigned to Support Agent
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {ticket.status !== 'CLOSED' && (
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
                onClick={() =>
                  router.push(
                    `/experiences/${ticket.experienceId}/chat/${ticket.id}`
                  )
                }
              >
                View Chat
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            <div>
              <Badge
                variant='outline'
                className='mb-2'
                style={{
                  backgroundColor: ticket.category.color + '20',
                  color: ticket.category.color,
                }}
              >
                {ticket.category.name}
              </Badge>
              <p className='text-gray-600'>{ticket.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        ticketId={ticket.id}
        ticketTitle={ticket.title}
      />
    </>
  );
}
