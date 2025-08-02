'use client';
import { ReviewResponse } from '@/app/api/reviews/route';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Componente para renderizar estrelas
const StarRating = ({
  rating,
  size = 'md',
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );
};

// Componente para um review individual
export const ReviewCard = ({
  review,
  showEditButton = false,
  onEdit,
}: {
  review: ReviewResponse;
  showEditButton?: boolean;
  onEdit: (review: ReviewResponse) => void;
}) => {
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className='dark:border-primary'>
      <CardContent className='p-6'>
        {/* Review Header */}
        <div
          className='
            grid 
            gap-4 
            mb-4
            grid-cols-1
            sm:grid-cols-[1fr_auto]
            items-start
          '
        >
          <div className='flex items-center gap-4'>
            <Avatar className='h-12 w-12 border-2'>
              <AvatarImage src={review.user.avatarUrl || ''} />
              <AvatarFallback className='font-semibold'>
                {review.user.username?.charAt(0).toUpperCase() || ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className='font-semibold'>{review.user.username}</h4>
              <div className='flex items-center gap-2 md:text-sm text-muted-foreground'>
                <Calendar className='h-4 w-4' />
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2 justify-start sm:justify-end mt-4 sm:mt-0'>
            <div className='flex items-center gap-2 border-primary border px-3 py-1 rounded-full'>
              <StarRating rating={review.rating} />
              <span className='text-sm font-semibold text-primary'>
                {review.rating}/5
              </span>
            </div>
            {showEditButton && (
              <Button
                size='sm'
                variant='outline'
                onClick={() => onEdit(review)}
                className='text-xs'
              >
                Edit Review
              </Button>
            )}
          </div>
        </div>

        {/* Review Feedback */}
        {review.feedback && (
          <ScrollArea className='max-h-40 overflow-y-auto'>
            <p style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
              {review.feedback}
            </p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
