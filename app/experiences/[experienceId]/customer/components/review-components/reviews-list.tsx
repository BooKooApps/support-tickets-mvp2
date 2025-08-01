import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ReviewDialog } from './review-dialog';
import { ReviewResponse } from '@/app/api/reviews/route';
import { Loader2 } from 'lucide-react';
import { ReviewCard } from './review-card';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ReviewsResponse {
  reviews: ReviewResponse[];
  pagination: PaginationInfo;
}

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

  // Pagination state
  const [allReviewsPagination, setAllReviewsPagination] =
    useState<PaginationInfo>({
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  const [userReviewsPagination, setUserReviewsPagination] =
    useState<PaginationInfo>({
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  const [reviewsPerPage] = useState(10);

  useEffect(() => {
    fetchReviews();
  }, []);
  const [userReviews, setUserReviews] = useState<ReviewResponse[]>([]);
  const fetchReviews = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/reviews?experienceId=${experienceId}&page=${page}&limit=${reviewsPerPage}`
      );
      if (response.ok) {
        const data: ReviewsResponse = await response.json();
        setReviews(data.reviews);
        setAllReviewsPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReviews = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/reviews?experienceId=${experienceId}&userOnly=true&page=${page}&limit=${reviewsPerPage}`
      );
      if (response.ok) {
        const data: ReviewsResponse = await response.json();
        setUserReviews(data.reviews);
        setUserReviewsPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'all') {
      fetchReviews(allReviewsPagination.currentPage);
    } else {
      fetchUserReviews(userReviewsPagination.currentPage);
    }
  };

  const handleEditReview = (review: ReviewResponse) => {
    setShowReviewDialog(true);
    setSelectedReview(review);
  };

  const handleReviewSubmitted = () => {
    if (activeTab === 'all') {
      fetchReviews(allReviewsPagination.currentPage);
    } else {
      fetchUserReviews(userReviewsPagination.currentPage);
    }
  };

  const handlePageChange = (page: number) => {
    if (activeTab === 'all') {
      fetchReviews(page);
    } else {
      fetchUserReviews(page);
    }
  };

  const getCurrentPagination = () => {
    return activeTab === 'all' ? allReviewsPagination : userReviewsPagination;
  };

  const renderPagination = () => {
    const pagination = getCurrentPagination();

    if (pagination.totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(i);
    }

    return (
      <Pagination className='mt-6'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              className={
                pagination.hasPreviousPage
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-50'
              }
              aria-disabled={!pagination.hasPreviousPage}
            />
          </PaginationItem>

          {pages.map(page => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => handlePageChange(page)}
                isActive={pagination.currentPage === page}
                className='cursor-pointer'
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              className={
                pagination.hasNextPage
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-50'
              }
              aria-disabled={!pagination.hasNextPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
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
            <div>
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

              {renderPagination()}
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
              {renderPagination()}
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
