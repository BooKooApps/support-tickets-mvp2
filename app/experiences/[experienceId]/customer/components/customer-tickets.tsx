import { prisma } from '@/lib/prisma';

import { CustomerTicketCard } from './customer-ticket-card';
import { verifyUser } from '@/lib/authentication';

export async function CustomerTickets({
  experienceId,
}: {
  experienceId: string;
}) {
  const { userId } = await verifyUser(experienceId);
  const tickets = await prisma.ticket.findMany({
    where: {
      experienceId: experienceId,
      creatorId: userId,
    },
    include: {
      category: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: [
      { status: 'asc' }, // OPEN first
      { createdAt: 'desc' },
    ],
  });

  if (tickets.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-gray-400 text-lg mb-2'>No support tickets yet</div>
        <div className='text-gray-500 text-sm'>
          Click "Create Ticket" above to get started
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {tickets.map(ticket => (
        <CustomerTicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
