'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  MessageCircle,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Quote,
} from 'lucide-react';
import { ReviewDialog } from '../components/review-dialog';
import { useParams } from 'next/navigation';

interface Review {
  id: string;
  rating: number;
  feedback?: string;
  createdAt: string;
  username: string;
  ticket: {
    title: string;
    description: string;
    createdAt: string;
  };
}

interface Ticket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

const ReviewsPage = () => {
  const params = useParams();
  const experienceId = params.experienceId as string;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchUserTickets();
  }, [experienceId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?experienceId=${experienceId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTickets = async () => {
    try {
      const response = await fetch(`/api/tickets?experienceId=${experienceId}`);
      if (response.ok) {
        const data = await response.json();
        const closedTickets = data.filter(
          (ticket: any) => ticket.status === 'CLOSED' && !ticket.review
        );
        setUserTickets(closedTickets);
      }
    } catch (error) {
      console.error('Error fetching user tickets:', error);
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
    fetchUserTickets();
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
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

  const LoadingSkeleton = () => (
    <div className='container mx-auto px-4 py-8 space-y-8'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-96' />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-40' />
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[1, 2, 3].map(i => (
              <div key={i} className='text-center space-y-2'>
                <Skeleton className='h-8 w-16 mx-auto' />
                <Skeleton className='h-4 w-24 mx-auto' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className='space-y-4'>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='flex items-start gap-4'>
                <Skeleton className='h-12 w-12 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-16 w-full' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const averageRating = Number.parseFloat(getAverageRating());
  const distribution = getRatingDistribution();

  return (
    <div className=''>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-2'>
          <h1 className='text-3xl font-bold '>Reviews & Feedback</h1>
        </div>
        <p className='text-muted-foreground text-lg'>
          Discover what others are saying about this Whop
        </p>
      </div>

      {/* Review Summary */}
      <Card className='mb-8'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <TrendingUp className='h-5 w-5 text-primary' />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Average Rating */}
            <div className='text-center'>
              <div className='mb-3'>
                <div className='text-4xl font-bold text-primary mb-1'>
                  {getAverageRating()}
                </div>
                <div className='flex justify-center mb-2'>
                  {renderStars(Math.round(averageRating), 'lg')}
                </div>
                <div className='text-sm text-muted-foreground font-medium'>
                  Average Rating
                </div>
              </div>
            </div>

            {/* Total Reviews */}
            <div className='text-center'>
              <div className='mb-3'>
                <div className='text-4xl font-bold text-blue-600 mb-1'>
                  {reviews.length}
                </div>
                <div className='flex justify-center mb-2'>
                  <Users className='h-5 w-5 text-blue-600' />
                </div>
                <div className='text-sm text-muted-foreground font-medium'>
                  Total Reviews
                </div>
              </div>
            </div>

            {/* Pending Reviews */}
            <div className='text-center'>
              <div className='mb-3'>
                <div className='text-4xl font-bold text-muted-foreground mb-1'>
                  {userTickets.length}
                </div>
                <div className='flex justify-center mb-2'>
                  <Clock className='h-5 w-5 text-muted-foreground' />
                </div>
                <div className='text-sm text-muted-foreground font-medium'>
                  Pending Reviews
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          {reviews.length > 0 && (
            <>
              <Separator className='my-6' />
              <div>
                <h3 className='font-semibold mb-4 '>Rating Distribution</h3>
                <div className='space-y-3'>
                  {Object.entries(distribution)
                    .reverse()
                    .map(([rating, count]) => {
                      const percentage =
                        reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={rating} className='flex items-center gap-4'>
                          <div className='flex items-center gap-1 w-12'>
                            <span className='text-sm font-medium'>
                              {rating}
                            </span>
                            <Star className='h-3 w-3 fill-primary text-primary' />
                          </div>
                          <div className='flex-1'>
                            <Progress value={percentage} className='h-2' />
                          </div>
                          <span className='text-sm text-muted-foreground w-8 text-right'>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Write Review Section */}
      {userTickets.length > 0 && (
        <Card className='mb-8 border-l-4 border-l-emerald-500 shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-emerald-700'>
              <MessageCircle className='h-5 w-5' />
              Share Your Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 mb-6'>
              You have{' '}
              <span className='font-semibold text-emerald-600'>
                {userTickets.length}
              </span>{' '}
              completed ticket
              {userTickets.length !== 1 ? 's' : ''} ready for review.
            </p>
            <div className='space-y-4'>
              {userTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className='flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all duration-200'
                >
                  <div className='flex-1'>
                    <h4 className='font-semibold text-gray-900 mb-1'>
                      {ticket.title}
                    </h4>
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                      <Calendar className='h-4 w-4' />
                      Completed on {formatDate(ticket.createdAt)}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowReviewDialog(true);
                    }}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white'
                  >
                    Write Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold '>Customer Reviews</h2>
          <Badge variant='secondary' className='px-3 py-1'>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {reviews.length === 0 ? (
          <Card className='border-2 border-dashed border-gray-200'>
            <CardContent className='py-16 text-center'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <MessageCircle className='h-8 w-8 text-muted-foreground' />
              </div>
              <h3 className='text-xl font-semibold text-muted-foreground mb-2'>
                No reviews yet
              </h3>
              <p className='text-muted-foreground max-w-md mx-auto'>
                Be the first to share your experience and help others make
                informed decisions!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-6'>
            {reviews.map(review => (
              <Card
                key={review.id}
                className='border-0 shadow-md hover:shadow-lg transition-shadow duration-200'
              >
                <CardContent className='p-6'>
                  {/* Review Header */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-4'>
                      <Avatar className='h-12 w-12 border-2 '>
                        <AvatarImage
                          src={`/placeholder.svg?height=48&width=48&text=${review.username.charAt(0)}`}
                        />
                        <AvatarFallback className=' font-semibold'>
                          {review.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className='font-semibold '>{review.username}</h4>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Calendar className='h-4 w-4' />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 border-primary border px-3 py-1 rounded-full'>
                      {renderStars(review.rating)}
                      <span className='text-sm font-semibold text-primary'>
                        {review.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Ticket Reference */}
                  <div className='mb-4 p-3  rounded-lg border-l-4 border-l-blue-500'>
                    <h5 className='font-medium mb-1'>
                      Regarding: {review.ticket.title}
                    </h5>
                    <p className='text-sm text-muted-foreground line-clamp-2'>
                      {review.ticket.description}
                    </p>
                  </div>

                  {/* Review Feedback */}
                  {review.feedback && (
                    <div className='relative'>
                      <Quote className='absolute top-2 left-2 h-5 w-5 text-muted-foreground' />
                      <div className=' rounded-lg p-4 pl-10'>
                        <p className='text-muted-foreground leading-relaxed italic'>
                          {review.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {selectedTicket && (
        <ReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          ticketId={selectedTicket.id}
          ticketTitle={selectedTicket.title}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default ReviewsPage;
