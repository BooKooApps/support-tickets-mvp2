import { verifyUser } from '@/lib/authentication';
import React from 'react';
import ChatHeader from './components/chat-header';
import { prisma } from '@/lib/prisma';
import { TicketWithRelations } from '../../customer/components/customer-tickets';
import { Category, Ticket, User } from '@prisma/client';
export type TicketWithCreatorAndCategory = Ticket & {
  category: Category;
  creator: User;
};

const layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ experienceId: string; ticketId: string }>;
}) => {
  const { experienceId, ticketId } = await params;

  const { accessLevel } = await verifyUser(experienceId);

  const ticket: TicketWithCreatorAndCategory | null =
    await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        creator: true,
        category: true,
      },
    });

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className='bg-background flex flex-col h-screen'>
      {/* Fixed Back Button - Top Left Corner */}
      <ChatHeader
        accessLevel={accessLevel}
        experienceId={experienceId}
        ticket={ticket}
      />
      {children}
    </div>
  );
};

export default layout;
