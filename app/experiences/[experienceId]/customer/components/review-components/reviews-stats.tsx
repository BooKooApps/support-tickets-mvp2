import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Eye, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const ReviewsStats = ({ companyId }: { companyId: string }) => {
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const stats = await fetch(`/api/reviews/${companyId}/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await stats.json();
        setAvgRating(data.avgRating);
        setTotalReviews(data.totalReviews);
        setAvgResponseTime(data.avgResponseTime);
      } catch (error) {
        console.error('Failed to fetch review stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [companyId]);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Star className='h-4 w-4 mr-2' /> Average Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className='h-4 w-24 mb-2' />
          ) : (
            <p className='text-2xl font-bold'>{avgRating}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Eye className='h-4 w-4 mr-2' /> Total Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className='h-4 w-24 mb-2' />
          ) : (
            <p className='text-2xl font-bold'>{totalReviews}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Clock className='h-4 w-4 mr-2' /> Average Response Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className='h-4 w-24 mb-2' />
          ) : (
            <p className='text-2xl font-bold'>{avgResponseTime}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsStats;
