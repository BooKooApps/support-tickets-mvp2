'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Ticket as TicketIcon } from 'lucide-react';
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
const ChatHeader = ({
  experienceId,
  ticket,
  accessLevel,
}: {
  experienceId: string;
  ticket: TicketWithCreatorAndCategory;
  accessLevel: 'admin' | 'customer';
}) => {
  const [isTicketInfoModalOpen, setIsTicketInfoModalOpen] = useState(false);
  const [width, height] = useWindowSize();
  const isMobile = width && width < 768;
  return (
    <header className='w-full flex justify-between items-center p-4 border-b'>
      <Link href={`/experiences/${experienceId}/customer?tab=TICKETS`}>
        <Button variant='ghost' size='sm'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Dashboard
        </Button>
      </Link>
      <div className='flex gap-2'>
        <Button
          size='sm'
          type='button'
          onClick={() => setIsTicketInfoModalOpen(true)}
        >
          View Ticket Details
        </Button>
        <Button size='sm' variant='ghost' type='button'>
          Close Ticket
        </Button>
      </div>
      {/* Ticket Information Modal */}
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
    </header>
  );
};

export default ChatHeader;
