import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, Clock, MessageCircle, Star } from 'lucide-react';

export async function DashboardStats({
  experienceId,
}: {
  experienceId: string;
}) {
  // Fetch statistics, all filtered by experienceId
  const [
    openTicketsCount,
    totalTickets,
    avgResponseTime,
    avgRating,
    categoryStats,
    recentActivity,
  ] = await Promise.all([
    prisma.ticket.count({
      where: { status: { in: ['OPEN', 'CLAIMED'] }, experienceId },
    }),
    prisma.ticket.count({
      where: { experienceId },
    }),
    getAverageResponseTime(experienceId),
    getAverageRating(experienceId),
    getCategoryStats(experienceId),
    getRecentActivity(experienceId),
  ]);

  return (
    <div className='space-y-6'>
      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Open Tickets</CardTitle>
            <Ticket className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{openTicketsCount}</div>
            <p className='text-xs text-muted-foreground'>
              {totalTickets} total tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Avg Response Time
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{avgResponseTime}</div>
            <p className='text-xs text-muted-foreground'>
              Time to first response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Messages Today
            </CardTitle>
            <MessageCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {recentActivity.messagesCount}
            </div>
            <p className='text-xs text-muted-foreground'>
              +{recentActivity.newTicketsCount} new tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Customer Rating
            </CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{avgRating}/5</div>
            <p className='text-xs text-muted-foreground'>
              Based on customer reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Most Common Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {categoryStats.map(category => (
              <div
                key={category.id}
                className='flex items-center justify-between'
              >
                <div className='flex items-center gap-2'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: category.color }}
                  />
                  <span className='font-medium'>{category.name}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>{category._count.tickets}</Badge>
                  <span className='text-sm text-muted-foreground'>
                    {totalTickets > 0
                      ? Math.round(
                          (category._count.tickets / totalTickets) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function getAverageResponseTime(experienceId: string) {
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

async function getAverageRating(experienceId: string) {
  const result = await prisma.review.aggregate({
    where: { experienceId },
    _avg: { rating: true },
  });

  return result._avg.rating ? result._avg.rating.toFixed(1) : '0.0';
}

async function getCategoryStats(experienceId: string) {
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

async function getRecentActivity(experienceId: string) {
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
