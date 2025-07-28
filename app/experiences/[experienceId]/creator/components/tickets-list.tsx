import { prisma } from '@/lib/prisma';
import { TicketCard } from './ticket-card';

export async function TicketsList() {
  const tickets = await prisma.ticket.findMany({
    where: {
      status: {
        in: ['OPEN', 'CLAIMED'],
      },
    },
    include: {
      creator: true,
      agent: true,
      category: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: true,
        },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: [
      { status: 'asc' }, // OPEN first, then CLAIMED
      { createdAt: 'desc' },
    ],
  });

  if (tickets.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-gray-400 text-lg mb-2'>No open tickets</div>
        <div className='text-gray-500 text-sm'>
          All caught up! New tickets will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
