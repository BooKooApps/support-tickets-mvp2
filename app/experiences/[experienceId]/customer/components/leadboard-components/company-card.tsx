'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Star, Clock, MessageSquare } from 'lucide-react';
import React from 'react';
import { Company } from './whop-leadboard-page';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CompanyCard = ({
  company,
  rank,
  getRankBadgeColor,
  getRankIcon,
}: {
  company: Company;
  rank: number;
  getRankBadgeColor: () => string;
  getRankIcon: () => React.ReactNode;
}) => {
  return (
    <Card
      onClick={e => {
        e.stopPropagation();
        window.open(`https://whop.com/${company.route}`, '_blank');
      }}
      key={company.id}
      className='cursor-pointer hover:scale-[1.01] dark:hover:border-primary transition-all duration-300'
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Badge className={`px-2 py-1 ${getRankBadgeColor()}`}>
              <div className='flex items-center gap-1'>
                {getRankIcon()}
                <span className='font-semibold'>#{rank}</span>
              </div>
            </Badge>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={company.logoUrl} />
              <AvatarFallback>{company.title.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className='text-lg'>
              <span>{company.title}</span>
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='grid gap-6 text-xs grid-cols-2 md:text-sm md:grid-cols-4 lg:grid-cols-8 items-start md:items-center'>
          {/* Rating */}
          <div className='flex items-center gap-2 p-3'>
            <Star className='h-4 w-4 text-primary fill-primary' />
            <div className='flex flex-col'>
              <span className='text-sm text-muted-foreground'>Rating</span>
              <div className='flex items-center gap-1'>
                <span className='font-semibold text-lg'>
                  {company.avgRating > 0 ? company.avgRating.toFixed(1) : 'N/A'}
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
          <div className='flex items-center gap-2 p-3'>
            <Clock className='h-4 w-4 text-green-600' />
            <div className='flex flex-col'>
              <span className='text-sm text-muted-foreground'>
                Avg Response Time
              </span>
              <span className='font-semibold text-lg'>
                {company.avgResponseTime > 0
                  ? company.avgResponseTime >= 3600
                    ? `${(company.avgResponseTime / 3600).toFixed(1)}h`
                    : company.avgResponseTime >= 60
                      ? `${Math.round(company.avgResponseTime / 60)}m`
                      : `${company.avgResponseTime}s`
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* Total Reviews */}
          <div className='flex items-center gap-2 p-3'>
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
};

export default CompanyCard;
