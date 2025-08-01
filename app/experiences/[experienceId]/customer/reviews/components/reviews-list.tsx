import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewDialog } from './review-dialog';
import { ReviewResponse } from '@/app/api/reviews/route';
import { Loader2 } from 'lucide-react';
import { ReviewCard } from './review-card';

const ReviewsList = ({
  experienceId,
  currentUserId,
}: {
  experienceId: string;
  currentUserId: string;
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<
    ReviewResponse | undefined
  >(undefined);

  useEffect(() => {
    fetchReviews();
  }, []);
  const [userReviews, setUserReviews] = useState<ReviewResponse[]>([]);
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

  const fetchUserReviews = async () => {
    try {
      const response = await fetch(
        `/api/reviews?experienceId=${experienceId}&userOnly=true`
      );
      if (response.ok) {
        const data = await response.json();
        setUserReviews(data);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setActiveTab(value);
    if (value === 'all') {
      fetchReviews();
    } else {
      fetchUserReviews();
    }
    setIsLoading(false);
  };

  const handleEditReview = (review: ReviewResponse) => {
    setShowReviewDialog(true);
    setSelectedReview(review);
  };

  const handleReviewSubmitted = () => {
    if (activeTab === 'all') {
      fetchReviews();
    } else {
      fetchUserReviews();
    }
  };

  return (
    <div className='space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='all'>All Reviews</TabsTrigger>
          <TabsTrigger value='mine'>My Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='mt-6'>
          {isLoading ? (
            <div className='flex justify-center items-center h-full'>
              <Loader2 className='animate-spin' />
            </div>
          ) : reviews.length > 0 ? (
            // <ReviewsList reviews={reviews} />
            <div>
              {reviews.map(review => (
                <ReviewCard
                  onEdit={handleEditReview}
                  key={review.id}
                  review={review}
                  showEditButton={review.user.id === currentUserId}
                />
              ))}
            </div>
          ) : (
            <div className='flex justify-center items-center h-full'>
              <p className='text-muted-foreground'>No reviews found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value='mine' className='mt-6'>
          {isLoading ? (
            <div className='flex justify-center items-center h-full'>
              <Loader2 className='animate-spin' />
            </div>
          ) : userReviews.length > 0 ? (
            <div>
              {userReviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showEditButton={review.user.id === currentUserId}
                  onEdit={handleEditReview}
                />
              ))}
            </div>
          ) : (
            <div className='flex justify-center items-center h-full'>
              <p className='text-muted-foreground'>No reviews found</p>
            </div>
          )}
        </TabsContent>

        {/* Review Dialog */}
        <ReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          onReviewSubmitted={handleReviewSubmitted}
          review={selectedReview}
        />
      </Tabs>
    </div>
  );
};

export default ReviewsList;
