'use server';
import { prisma } from '@/lib/prisma';

export async function getAverageResponseTime(experienceId: string) {
  const tickets = await prisma.ticket.findMany({
    where: {
      claimedAt: { not: null },
      experienceId,
    },
    select: {
      createdAt: true,
      claimedAt: true,
    },
  });

  if (tickets.length === 0) return '0h';

  const totalMinutes = tickets.reduce((sum, ticket) => {
    const diff =
      new Date(ticket.claimedAt!).getTime() -
      new Date(ticket.createdAt).getTime();
    return sum + diff / (1000 * 60); // Convert to minutes
  }, 0);

  const avgMinutes = totalMinutes / tickets.length;

  if (avgMinutes < 60) {
    return `${Math.round(avgMinutes)}m`;
  } else {
    return `${Math.round(avgMinutes / 60)}h`;
  }
}

export async function getAverageRating(experienceId: string) {
  const result = await prisma.review.aggregate({
    where: { experienceId },
    _avg: { rating: true },
  });

  return result._avg.rating ? result._avg.rating.toFixed(1) : '0.0';
}

export async function getCategoryStats(experienceId: string) {
  return await prisma.category.findMany({
    where: { experienceId },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
    orderBy: {
      tickets: {
        _count: 'desc',
      },
    },
  });
}

export async function getRecentActivity(experienceId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only count messages for tickets in this experience
  const [messagesCount, newTicketsCount] = await Promise.all([
    prisma.message.count({
      where: {
        createdAt: { gte: today },
        ticket: {
          experienceId,
        },
      },
    }),
    prisma.ticket.count({
      where: {
        createdAt: { gte: today },
        experienceId,
      },
    }),
  ]);

  return { messagesCount, newTicketsCount };
}

export async function getTotalTickets(experienceId: string) {
  return await prisma.ticket.count({
    where: { experienceId },
  });
}

export async function getOpenTicketsCount(experienceId: string) {
  return await prisma.ticket.count({
    where: {
      experienceId,
      status: { in: ['OPEN', 'CLAIMED'] },
    },
  });
}
