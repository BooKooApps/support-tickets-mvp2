'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTimeAgo } from '@/lib/utils';
import { MessageCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { ReviewDialog } from './review-components/review-dialog';
import type { TicketWithRelations } from './customer-tickets';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWindowSize } from '@react-hook/window-size';

export function CustomerTicketCard({
  ticket,
  accessLevel,
  experienceId,
  setTickets,
}: {
  ticket: TicketWithRelations;
  experienceId: string;
  setTickets: React.Dispatch<React.SetStateAction<TicketWithRelations[]>>;
  accessLevel: 'customer' | 'admin';
}) {
  const router = useRouter();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/tickets/${ticket.id}/close?experienceId=${experienceId}`,
        {
          method: 'POST',
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.shouldShowReviewDialog && accessLevel === 'customer') {
          setShowReviewDialog(true);
        }
      }
    } catch (error) {
      console.error('Failed to close ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/tickets/${ticket.id}/claim?experienceId=${experienceId}`,
        {
          method: 'POST',
        }
      );
    } catch (error) {
      console.error('Failed to claim ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    OPEN: {
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      text: 'Waiting for support',
      dotColor: 'bg-red-500',
    },
    CLAIMED: {
      // should be emerald
      color:
        'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      text: 'Being handled',
      dotColor: 'bg-emerald-500',
    },
    CLOSED: {
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      text: 'Resolved',
      dotColor: 'bg-green-500',
    },
  };

  const currentStatus = statusConfig[ticket.status];

  // Handler for clicking the card to go to chat
  const handleCardClick = () => {
    router.push(`/experiences/${experienceId}/chat/${ticket.id}`);
  };

  const [width, height] = useWindowSize();
  const isMobile = width && width < 768;

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
                <h3 className='font-semibold text-base md:text-lg  leading-tight mb-2'>
                  {ticket.title}
                </h3>
                {/* Category */}
                {!isMobile && (
                  <Badge
                    style={{
                      backgroundColor: ticket.category.color,
                    }}
                    className={`border-0 font-medium px-3 py-1`}
                  >
                    {ticket.category.name}
                  </Badge>
                )}
              </div>

              {/* User and Metadata */}
              <div className='grid gap-6 text-xs grid-cols-2 md:text-sm md:grid-cols-4 lg:grid-cols-8 items-start md:items-center'>
                <div className='flex items-center gap-2 col-span-2 md:col-span-1'>
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

                <Badge
                  className={`${currentStatus.color} border col-span-2 md:col-span-1 w-full md:w-fit font-medium px-3 py-1 flex items-center gap-1.5`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${currentStatus.dotColor}`}
                  />
                  {currentStatus.text}
                </Badge>

                {isMobile && (
                  <Badge
                    style={{
                      backgroundColor: ticket.category.color,
                    }}
                    className={`border-0 font-medium px-3 py-1 col-span-2 md:col-span-1`}
                  >
                    {ticket.category.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={
                ticket.status === 'OPEN' && accessLevel === 'admin'
                  ? 'flex items-center gap-2'
                  : 'flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity'
              }
              // Prevent card click when clicking on buttons
              onClick={e => e.stopPropagation()}
            >
              <RenderActionButtons
                ticket={ticket}
                accessLevel={accessLevel}
                isLoading={isLoading}
                handleClose={handleClose}
                handleClaim={handleClaim}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-0'>
          <div className='space-y-3'>
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

const RenderActionButtons = ({
  ticket,
  accessLevel,
  isLoading,
  handleClose,
  handleClaim,
}: {
  ticket: TicketWithRelations;
  accessLevel: 'customer' | 'admin';
  isLoading: boolean;
  handleClose: () => void;
  handleClaim: () => void;
}) => {
  if (accessLevel === 'admin') {
    if (ticket.status === 'OPEN') {
      return (
        <Button
          size='sm'
          className='animate-pulse'
          onClick={handleClaim}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <CheckCircle2 className='h-4 w-4 mr-1' />
          )}
          Claim Ticket
        </Button>
      );
    }

    if (ticket.status === 'CLAIMED') {
      return (
        <Button
          size='sm'
          variant='outline'
          onClick={handleClose}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <CheckCircle2 className='h-4 w-4 mr-1' />
          )}
          Close
        </Button>
      );
    }
  }

  if (ticket.status !== 'CLOSED') {
    return (
      <Button
        size='sm'
        variant='outline'
        onClick={handleClose}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <CheckCircle2 className='h-4 w-4 mr-1' />
        )}
        Close
      </Button>
    );
  }
};
