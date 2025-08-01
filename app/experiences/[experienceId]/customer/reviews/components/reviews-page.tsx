'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  MessageCircle,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Quote,
} from 'lucide-react';
import { ReviewDialog } from './review-dialog';
import { EditReviewDialog } from './edit-review-dialog';
import { ReviewResponse } from '@/app/api/reviews/route';
import ReviewsList from './reviews-list';

// Componente para o cabeçalho da página
const ReviewsHeader = () => (
  <div className='mb-8'>
    <div className='flex items-center gap-3 mb-2'>
      <h1 className='text-3xl font-bold '>Reviews & Feedback</h1>
    </div>
    <p className='text-muted-foreground text-lg'>
      Discover what others are saying about this Whop
    </p>
  </div>
);



// Componente para estatísticas de review
const ReviewStats = ({
  averageRating,
  totalReviews,
  pendingReviews,
}: {
  averageRating: number;
  totalReviews: number;
  pendingReviews: number;
}) => (
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
        {/* <div className='text-center'>
          <div className='mb-3'>
            <div className='text-4xl font-bold text-primary mb-1'>
              {averageRating.toFixed(1)}
            </div>
            <div className='flex justify-center mb-2'>
              <StarRating rating={Math.round(averageRating)} size='lg' />
            </div>
            <div className='text-sm text-muted-foreground font-medium'>
              Average Rating
            </div>
          </div>
        </div> */}

        {/* Total Reviews */}
        <div className='text-center'>
          <div className='mb-3'>
            <div className='text-4xl font-bold text-blue-600 mb-1'>
              {totalReviews}
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
              {pendingReviews}
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
    </CardContent>
  </Card>
);

// Componente para distribuição de ratings
const RatingDistribution = ({
  distribution,
  totalReviews,
}: {
  distribution: Record<number, number>;
  totalReviews: number;
}) => (
  <>
    <Separator className='my-6' />
    <div>
      <h3 className='font-semibold mb-4 '>Rating Distribution</h3>
      <div className='space-y-3'>
        {Object.entries(distribution)
          .reverse()
          .map(([rating, count]) => {
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={rating} className='flex items-center gap-4'>
                <div className='flex items-center gap-1 w-12'>
                  <span className='text-sm font-medium'>{rating}</span>
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
);

// Componente de loading
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

const ReviewsPage = ({ experienceId, currentUserId }: { experienceId: string, currentUserId: string }) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(
    null
  );
  const [showEditReviewDialog, setShowEditReviewDialog] = useState(false);

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const handleEditReview = (review: ReviewResponse) => {
    setSelectedReview(review);
    setShowEditReviewDialog(true);
  };

  const handleReviewUpdated = () => {
    setShowEditReviewDialog(false);
    setSelectedReview(null);
  };

//   if (isLoading) {
//     return <LoadingSkeleton />;
//   }

  const averageRating = getAverageRating();
  const distribution = getRatingDistribution();
  return (
    <div>
      {/* header */}
      <ReviewsHeader />

      {/* stats */}
      {/* <ReviewStats
        averageRating={averageRating}
        totalReviews={reviews.length}
        pendingReviews={userTickets.length}
      /> */}

      {/* rating distribution */}
      {reviews.length > 0 && (
        <Card className='mb-8'>
          <CardContent>
            <RatingDistribution
              distribution={distribution}
              totalReviews={reviews.length}
            />
          </CardContent>
        </Card>
      )}

      {/* customers reviews section */}
      <ReviewsList currentUserId={currentUserId} experienceId={experienceId} />

      {/* Edit Review Dialog */}
      <EditReviewDialog
        open={showEditReviewDialog}
        onOpenChange={setShowEditReviewDialog}
        review={selectedReview}
        onReviewUpdated={handleReviewUpdated}
      />
    </div>
  );
};

export default ReviewsPage;
