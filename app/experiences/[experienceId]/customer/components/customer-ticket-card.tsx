'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTimeAgo } from '@/lib/utils';
import { MessageCircle, Clock, User, CheckCircle2 } from 'lucide-react';
import { ReviewDialog } from './review-dialog';
import type { TicketWithRelations } from './customer-tickets';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function CustomerTicketCard({
  ticket,
  viewerRole = 'customer',
}: {
  ticket: TicketWithRelations;
  viewerRole?: 'customer' | 'creator';
}) {
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

  const statusConfig = {
    OPEN: {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: Clock,
      text: 'Waiting for support',
      dotColor: 'bg-red-500',
    },
    CLAIMED: {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: User,
      text: 'Being handled',
      dotColor: 'bg-amber-500',
    },
    CLOSED: {
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle2,
      text: 'Resolved',
      dotColor: 'bg-green-500',
    },
  };

  const currentStatus = statusConfig[ticket.status];
  const StatusIcon = currentStatus.icon;

  // Handler for clicking the card to go to chat
  const handleCardClick = () => {
    router.push(`/experiences/${ticket.experienceId}/chat/${ticket.id}`);
  };

  return (
    <>
      <Card
        className='group hover:shadow-lg hover:scale-[1.01] dark:hover:shadow-primary/10 dark:shadow-xl hover:border-primary transition-all duration-200   cursor-pointer'
        onClick={handleCardClick}
        tabIndex={0}
        role='button'
        aria-label={`View chat for ticket ${ticket.title}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCardClick();
          }
        }}
      >
        <CardHeader className='pb-4'>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1 space-y-3'>
              {/* Title and Status */}
              <div className='flex items-start gap-3'>
                <div className='flex-1'>
                  <h3 className='font-semibold text-lg  leading-tight mb-2'>
                    {ticket.title}
                  </h3>
                  <Badge
                    className={`${currentStatus.color} border font-medium px-3 py-1 flex items-center gap-1.5 w-fit`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${currentStatus.dotColor}`}
                    />
                    <StatusIcon className='h-3.5 w-3.5' />
                    {currentStatus.text}
                  </Badge>
                </div>
              </div>

              {/* User and Metadata */}
              <div className='flex items-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-7 w-7'>
                    <AvatarImage src={ticket.creator.avatarUrl || ''} />
                    <AvatarFallback className='text-xs '>
                      {ticket.creator.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className='font-medium '>
                    {ticket.creator.username}
                  </span>
                </div>

                <div className='flex items-center gap-1 text-muted-foreground'>
                  <Clock className='h-4 w-4' />
                  <span>{getTimeAgo(new Date(ticket.createdAt))}</span>
                </div>

                <div className='flex items-center gap-1 text-muted-foreground'>
                  <MessageCircle className='h-4 w-4' />
                  <span className='font-medium'>{ticket._count.messages}</span>
                  <span>messages</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'
              // Prevent card click when clicking on buttons
              onClick={e => e.stopPropagation()}
            >
              {ticket.status !== 'CLOSED' && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  <CheckCircle2 className='h-4 w-4 mr-1' />
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-0'>
          <div className='space-y-3'>
            {/* Category */}

            <Badge className='border-0 font-medium px-3 py-1'>
              {ticket.category.name}
            </Badge>

            {/* Description */}
            <p className='text-muted-foreground leading-relaxed line-clamp-2'>
              {ticket.description}
            </p>
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
