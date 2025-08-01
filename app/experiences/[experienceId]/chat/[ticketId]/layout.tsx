import { verifyUser } from '@/lib/authentication';
import React from 'react';
import ChatHeader from './components/chat-header';
import { prisma } from '@/lib/prisma';

const layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ experienceId: string; ticketId: string }>;
}) => {
  const { experienceId, ticketId } = await params;

  const { accessLevel } = await verifyUser(experienceId);

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      creator: true,
      category: true,
    },
  });

  return (
    <div className='bg-background flex flex-col h-screen'>
      {/* Fixed Back Button - Top Left Corner */}
      <ChatHeader experienceId={experienceId} ticket={ticket} />
      {children}
    </div>
  );
};

export default layout;
