'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Search,
  Trophy,
  Star,
  Clock,
  MessageSquare,
  Flame,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';

interface Company {
  id: string;
  title: string;
  avgRating: number;
  avgResponseTime: number;
  totalReviews: number;
}

interface LeaderboardResponse {
  companies: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ApiError {
  error: string;
}

const WhopLeadboardPage = ({
  experienceId,
  companyId,
  accessLevel,
}: {
  experienceId: string;
  companyId: string;
  accessLevel: string;
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  const fetchLeaderboard = useCallback(
    async (page: number, searchTerm: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          ...(searchTerm && { search: searchTerm }),
        });

        const response = await fetch(`/api/whop-leadboard?${params}`);
        const data: LeaderboardResponse | ApiError = await response.json();

        if (!response.ok) {
          throw new Error(
            (data as ApiError).error || 'Failed to fetch leaderboard'
          );
        }

        const leaderboardData = data as LeaderboardResponse;
        setCompanies(leaderboardData.companies);
        setPagination(leaderboardData.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchLeaderboard(pagination.page, debouncedSearch);
  }, [fetchLeaderboard, pagination.page, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      <header className='flex justify-between items-start'>
        <div className='flex items-center w-full justify-between'>
          <div className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            <h1 className='text-xl font-bold'>Whop Leaderboard</h1>
          </div>
        </div>
      </header>

      {/* Search bar */}
      <div className='flex w-full gap-4 items-center mt-4'>
        <Label htmlFor='search'>
          <Search className='h-4 w-4' />
        </Label>
        <Input
          id='search'
          className='md:w-1/3'
          type='text'
          placeholder='Search companies...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
          Error: {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className='flex justify-center items-center mt-8'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span className='ml-2'>Loading leaderboard...</span>
        </div>
      )}

      {/* Results info */}
      {!isLoading && !error && (
        <div className='mt-4 text-sm text-muted-foreground'>
          Showing {companies.length} of {pagination.total} companies
          {debouncedSearch && ` matching "${debouncedSearch}"`}
        </div>
      )}

      {/* Company list */}
      {!isLoading && !error && (
        <div className='flex flex-col gap-4 mt-6'>
          {companies.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              {debouncedSearch
                ? 'No companies found matching your search.'
                : 'No companies found.'}
            </div>
          ) : (
            companies.map((company, index) => {
              const rank = (pagination.page - 1) * pagination.limit + index + 1;
              const getRankIcon = () => {
                switch (rank) {
                  case 1:
                    return (
                      <div className='flex items-center gap-1'>
                        <Flame className='h-5 w-5 text-primary-foreground' />
                        <Flame className='h-5 w-5 text-primary-foreground' />
                        <Flame className='h-5 w-5 text-primary-foreground' />
                      </div>
                    );
                  case 2:
                    return (
                      <div className='flex items-center gap-1'>
                        <Flame className='h-5 w-5 text-primary-foreground' />
                        <Flame className='h-5 w-5 text-primary-foreground' />
                      </div>
                    );
                  case 3:
                    return (
                      <div className='flex items-center gap-1'>
                        <Flame className='h-5 w-5 text-primary-foreground' />
                      </div>
                    );
                  default:
                    return null;
                }
              };

              const getRankBadgeColor = () => {
                switch (rank) {
                  case 1:
                    return '';
                  case 2:
                    return '';
                  case 3:
                    return '';
                  default:
                    return 'bg-muted text-muted-foreground';
                }
              };

              return (
                <Card key={company.id} className=''>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <Badge className={`px-2 py-1 ${getRankBadgeColor()}`}>
                          <div className='flex items-center gap-1'>
                            {getRankIcon()}
                            <span className='font-semibold'>#{rank}</span>
                          </div>
                        </Badge>
                        <CardTitle className='text-lg'>
                          {company.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      {/* Rating */}
                      <div className='flex items-center gap-2 p-3 rounded-lg border'>
                        <Star className='h-4 w-4 text-primary fill-primary' />
                        <div className='flex flex-col'>
                          <span className='text-sm text-muted-foreground'>
                            Rating
                          </span>
                          <div className='flex items-center gap-1'>
                            <span className='font-semibold text-lg'>
                              {company.avgRating > 0
                                ? company.avgRating.toFixed(1)
                                : 'N/A'}
                            </span>
                            {company.avgRating > 0 && (
                              <div className='flex items-center'>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < Math.floor(company.avgRating)
                                        ? 'text-primary fill-primary'
                                        : i < company.avgRating
                                          ? 'text-primary fill-primary opacity-50'
                                          : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Response Time */}
                      <div className='flex items-center gap-2 p-3 rounded-lg border'>
                        <Clock className='h-4 w-4 text-green-600' />
                        <div className='flex flex-col'>
                          <span className='text-sm text-muted-foreground'>
                            Avg Response
                          </span>
                          <span className='font-semibold text-lg'>
                            {company.avgResponseTime > 0
                              ? `${company.avgResponseTime}s`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Total Reviews */}
                      <div className='flex items-center gap-2 p-3 rounded-lg border'>
                        <MessageSquare className='h-4 w-4 text-purple-600' />
                        <div className='flex flex-col'>
                          <span className='text-sm text-muted-foreground'>
                            Total Reviews
                          </span>
                          <span className='font-semibold text-lg'>
                            {company.totalReviews.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && pagination.totalPages > 1 && (
        <div className='flex justify-center items-center gap-2 mt-8'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            <ChevronLeft className='h-4 w-4' />
            Previous
          </Button>

          <div className='flex items-center gap-1'>
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const pageNumber =
                  Math.max(
                    1,
                    Math.min(pagination.totalPages - 4, pagination.page - 2)
                  ) + i;

                if (pageNumber > pagination.totalPages) return null;

                return (
                  <Button
                    key={pageNumber}
                    variant={
                      pagination.page === pageNumber ? 'default' : 'outline'
                    }
                    size='sm'
                    onClick={() => handlePageChange(pageNumber)}
                    className='w-8 h-8'
                  >
                    {pageNumber}
                  </Button>
                );
              }
            )}
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            Next
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
};

export default WhopLeadboardPage;
