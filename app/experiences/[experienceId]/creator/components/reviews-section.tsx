import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export async function ReviewsSection() {
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: { name: true },
      },
      ticket: {
        select: { title: true, category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const ratingDistribution = await getRatingDistribution();

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingDistribution[rating] || 0;
            const total = Object.values(ratingDistribution).reduce(
              (a, b) => a + b,
              0
            );
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={rating} className='flex items-center gap-2'>
                <div className='flex items-center gap-1 w-12'>
                  <span className='text-sm'>{rating}</span>
                  <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                </div>
                <div className='flex-1 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-yellow-400 h-2 rounded-full transition-all'
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className='text-sm text-muted-foreground w-8'>
                  {count}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card className='lg:col-span-2'>
        <CardHeader>
          <CardTitle>Recent Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              No reviews yet
            </div>
          ) : (
            <div className='space-y-6'>
              {reviews.map(review => (
                <div key={review.id} className='border-b pb-4 last:border-b-0'>
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback className='text-sm'>
                          {review.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium text-sm'>
                          {review.user.name}
                        </div>
                        <div className='flex items-center gap-1'>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-xs text-gray-500'>
                        {formatDate(new Date(review.createdAt))}
                      </div>
                      <Badge
                        variant='outline'
                        className='mt-1'
                        style={{
                          backgroundColor: review.ticket.category.color + '20',
                          color: review.ticket.category.color,
                        }}
                      >
                        {review.ticket.category.name}
                      </Badge>
                    </div>
                  </div>

                  <div className='text-sm text-gray-600 mb-2'>
                    <strong>Ticket:</strong> {review.ticket.title}
                  </div>

                  {review.feedback && (
                    <p className='text-sm text-gray-700'>{review.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getRatingDistribution() {
  const reviews = await prisma.review.groupBy({
    by: ['rating'],
    _count: { rating: true },
  });

  const distribution: Record<number, number> = {};
  reviews.forEach(({ rating, _count }) => {
    distribution[rating] = _count.rating;
  });

  return distribution;
}
