'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Check,
  Clock,
  Eye,
  Home,
  Loader2,
  Menu,
  Ticket as TicketIcon,
  X,
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getTimeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TicketWithCreatorAndCategory } from '../layout';
import { useWindowSize } from '@react-hook/window-size';
import { ThemeToggle } from '@/components/theme-toggle';
import { useOnWebsocketMessage } from '@whop/react';
import { WebsocketMessage } from '@/app/api/tickets/[id]/messages/route';

const ChatHeader = ({
  experienceId,
  ticket,
  accessLevel,
}: {
  experienceId: string;
  ticket: TicketWithCreatorAndCategory;
  accessLevel: 'admin' | 'customer';
}) => {
  const [width] = useWindowSize();
  const [isTicketClosed, setIsTicketClosed] = useState(false);
  const [isClosingLoading, setIsClosingLoading] = useState(false);
  useEffect(() => {
    console.log('ticket.status', ticket.status);
    if (ticket.status === 'CLOSED') {
      setIsTicketClosed(true);
    }
  }, [ticket.status]);

  const handleClose = async () => {
    setIsClosingLoading(true);
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
          // setShowReviewDialog(true);
        }
      }
    } catch (error) {
      console.error('Failed to close ticket:', error);
    } finally {
      setIsClosingLoading(false);
    }
  };

  useOnWebsocketMessage(message => {
    if (message.isTrusted) {
      try {
        const websocketMessage: WebsocketMessage = JSON.parse(message.json);
        console.log('websocketMessage', websocketMessage);

        // only handle messages for the current company
        if (websocketMessage.companyId !== ticket.companyId) {
          return;
        }

        // only handle messages for the current ticket
        if (websocketMessage.ticketId !== ticket.id) {
          return;
        }

        // if the message does not have data, return
        if (!websocketMessage.data) {
          return;
        }

        switch (websocketMessage.type) {
          case 'TICKET_CLOSED':
            // refresh the current data for both admin and customer
            setIsTicketClosed(true);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Failed to parse websocket message:', error);
      }
    }
  });

  const isMobile = width && width < 768;

  if (!isMobile) {
    return (
      <header className='w-full flex justify-between items-center p-4 border-b'>
        <Link href={`/experiences/${experienceId}/customer?tab=TICKETS`}>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Dashboard
          </Button>
        </Link>
        <div className='flex gap-2'>
          <ViewTicketDetailsButton ticket={ticket} isMobile={false} />

          {!isTicketClosed && (
            <Button
              size='sm'
              variant='ghost'
              type='button'
              onClick={handleClose}
              disabled={isClosingLoading}
            >
              {isClosingLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Close Ticket.
                </>
              ) : (
                'Close Ticket'
              )}
            </Button>
          )}
        </div>
      </header>
    );
  }

  return (
    <MobileSidebar
      experienceId={experienceId}
      accessLevel={accessLevel}
      ticket={ticket}
      isClosingLoading={isClosingLoading}
      handleClose={handleClose}
    />
  );
};

const ViewTicketDetailsButton = ({
  ticket,
  isMobile,
}: {
  ticket: TicketWithCreatorAndCategory;
  isMobile: boolean;
}) => {
  const [isTicketInfoModalOpen, setIsTicketInfoModalOpen] = useState(false);
  return (
    <>
      <Button
        size={isMobile ? 'lg' : 'sm'}
        type='button'
        onClick={() => setIsTicketInfoModalOpen(true)}
        className={
          isMobile ? 'w-full flex items-center justify-start gap-2' : ''
        }
      >
        <Eye className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} />
        View Ticket Details
      </Button>
      <Dialog
        open={isTicketInfoModalOpen}
        onOpenChange={setIsTicketInfoModalOpen}
      >
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <TicketIcon className='h-5 w-5' />
              Ticket Information
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-6'>
            {/* Ticket Details */}
            <div className='space-y-4'>
              <div className='flex items-start justify-between'>
                <div className='space-y-2 flex-1'>
                  <h2 className='text-2xl font-bold'>{ticket.title}</h2>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={ticket.creator.avatarUrl || ''}
                          alt={ticket.creator.username || ''}
                        />
                        <AvatarFallback className='text-xs'>
                          {ticket.creator.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {ticket.creator.username}
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      {getTimeAgo(new Date(ticket.createdAt))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category and Description */}
              <div className='space-y-2'>
                <Badge
                  variant='outline'
                  style={{
                    backgroundColor: ticket.category.color + '20',
                    color: ticket.category.color,
                  }}
                >
                  {ticket.category.name}
                </Badge>
                <div className='space-y-2'>
                  <h3 className='font-semibold'>Description:</h3>
                  <p className='text-muted-foreground bg-muted p-3 rounded-lg'>
                    {ticket.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const MobileSidebar = ({
  experienceId,
  accessLevel,
  ticket,
  isClosingLoading,
  handleClose,
}: {
  experienceId: string;
  accessLevel: 'admin' | 'customer';
  ticket: TicketWithCreatorAndCategory;
  isClosingLoading: boolean;
  handleClose: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top bar with menu button */}
      <header className='flex items-center justify-between px-4 py-2 border-b'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsOpen(true)}
          aria-label='Open sidebar'
        >
          <Menu className='h-5 w-5' />
        </Button>
        <div>
          <ThemeToggle />
        </div>
      </header>
      {/* Sidebar Drawer */}
      {isOpen && (
        <div className='fixed inset-0 z-50 bg-black/40'>
          <nav className='fixed top-0 left-0 h-full w-64 bg-background shadow-lg flex flex-col z-50 animate-in slide-in-from-left duration-200'>
            <div className='flex items-center justify-between px-4 py-3 border-b'>
              <span className='font-bold text-lg'>Menu</span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsOpen(false)}
                aria-label='Close sidebar'
              >
                <X className='h-5 w-5' />
              </Button>
            </div>
            <div className='flex-1 flex flex-col gap-4 px-2 py-4'>
              <ViewTicketDetailsButton isMobile={true} ticket={ticket} />
              <Button
                size='lg'
                variant='ghost'
                type='button'
                onClick={handleClose}
                disabled={isClosingLoading}
                className='w-full flex items-center justify-start gap-2'
              >
                {isClosingLoading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Close Ticket
                  </>
                ) : (
                  <>
                    <Check className='h-4 w-4' />
                    Close Ticket
                  </>
                )}
              </Button>
              <Link href={`/experiences/${experienceId}/customer?tab=TICKETS`}>
                <Button
                  variant='ghost'
                  size='lg'
                  onClick={() => setIsOpen(false)}
                  className='w-full flex items-center justify-start gap-2'
                >
                  <Home className='h-4 w-4' />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </nav>
          {/* Clickable overlay to close */}
          <div
            className='fixed inset-0 z-40'
            onClick={() => setIsOpen(false)}
            aria-label='Close sidebar overlay'
          />
        </div>
      )}
    </>
  );
};

export default ChatHeader;
