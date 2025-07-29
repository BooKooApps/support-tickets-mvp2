import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, Clock, MessageCircle, Star } from 'lucide-react';
import {
  getAverageResponseTime,
  getAverageRating,
  getCategoryStats,
  getRecentActivity,
  getTotalTickets,
  getOpenTicketsCount,
} from '../actions/actions';

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
    getOpenTicketsCount(experienceId),
    getTotalTickets(experienceId),
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
