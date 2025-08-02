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
import { WebsocketMessage } from '@/lib/websocket';

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
    console.log('message received', message);
    if (message.isTrusted) {
      try {
        const websocketMessage: WebsocketMessage = JSON.parse(message.json);
        console.log('websocketMessage', websocketMessage);
        //         {
        //     "type": "TICKET_CLOSED",
        //     "companyId": "biz_jgs9mn7GMyO9Ni",
        //     "data": {
        //         "id": "cmdupm5ms0001vbnid6oiwu7v",
        //         "companyId": "biz_jgs9mn7GMyO9Ni",
        //         "title": "Ticket test",
        //         "description": "Test ticket for development",
        //         "status": "CLOSED",
        //         "priority": "MEDIUM",
        //         "creatorId": "user_V6tvGS4834UX3",
        //         "categoryId": "cmdth9iwi0000vbqwtoi9k50c",
        //         "createdAt": "2025-08-02T20:33:09.889Z",
        //         "updatedAt": "2025-08-02T20:34:07.707Z",
        //         "claimedAt": null,
        //         "closedAt": "2025-08-02T20:34:07.705Z",
        //         "category": {
        //             "id": "cmdth9iwi0000vbqwtoi9k50c",
        //             "companyId": "biz_jgs9mn7GMyO9Ni",
        //             "name": "General",
        //             "description": "Ask questions or get general help about our services.",
        //             "color": "#3B82F6",
        //             "createdAt": "2025-08-01T23:51:37.458Z",
        //             "updatedAt": "2025-08-01T23:51:37.458Z"
        //         },
        //         "creator": {
        //             "username": "lucasklemke",
        //             "email": null,
        //             "avatarUrl": "https://assets.whop.com/uploads/2025-07-25/user_15272610_8d1cc352-7c4e-4385-a7e4-20d6e2a27749.jpeg"
        //         },
        //         "messages": [
        //             {
        //                 "id": "cmdupm8850003vbni9jj68wl1",
        //                 "content": "We will get back to you as soon as possible. Thank you for your patience.",
        //                 "createdAt": "2025-08-02T20:33:13.253Z",
        //                 "updatedAt": "2025-08-02T20:33:13.253Z",
        //                 "userId": null,
        //                 "agentId": "cmdth9jx80005vbqwvb9du22a",
        //                 "ticketId": "cmdupm5ms0001vbnid6oiwu7v"
        //             }
        //         ],
        //         "_count": {
        //             "messages": 1
        //         }
        //     }
        // }

        // only handle messages for the current company
        if (websocketMessage.companyId !== ticket.companyId) {
          console.log(
            'companyId mismatch',
            websocketMessage.companyId,
            ticket.companyId
          );
          return;
        }

        // only handle messages for the current ticket
        if (websocketMessage.ticketId !== ticket.id) {
          console.log(
            'ticketId mismatch',
            websocketMessage.ticketId,
            ticket.id
          );
          return;
        }

        // if the message does not have data, return
        if (!websocketMessage.data) {
          console.log('no data', websocketMessage);
          return;
        }

        switch (websocketMessage.type) {
          case 'TICKET_CLOSED':
            console.log('ticket closed');
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
