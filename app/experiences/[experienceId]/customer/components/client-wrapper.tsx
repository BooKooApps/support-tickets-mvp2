'use client';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { CustomerTickets } from './customer-tickets';
import ReviewsPage from './review-components/reviews-page';
import WhopLeadboardPage from './leadboard-components/whop-leadboard-page';
import { Company } from '@prisma/client';

const ClientWrapper = ({
  experienceId,
  accessLevel,
  company,
  companyId,
  userId,
}: {
  experienceId: string;
  accessLevel: 'admin' | 'customer';
  company: Company;
  userId: string;
  companyId: string;
}) => {
  const searchParams = useSearchParams();
  const tab: 'TICKETS' | 'REVIEWS' | 'LEADBOARD' | 'SETTINGS' =
    searchParams.get('tab') as 'TICKETS' | 'REVIEWS' | 'LEADBOARD' | 'SETTINGS';

  switch (tab) {
    case 'TICKETS':
      return (
        <div className='space-y-6'>
          <CustomerTickets
            experienceId={experienceId}
            accessLevel={accessLevel}
            companyId={companyId}
          />
        </div>
      );

    case 'REVIEWS':
      return (
        <ReviewsPage
          accessLevel={accessLevel}
          experienceId={experienceId}
          currentUserId={userId}
          companyTitle={company?.title || ''}
          companyId={companyId}
        />
      );
    case 'LEADBOARD':
      return (
        <WhopLeadboardPage
          experienceId={experienceId}
          companyId={companyId}
          accessLevel={accessLevel}
        />
      );
    case 'SETTINGS':
      return <div>Not ready yet</div>;
    default:
      return (
        <div className='space-y-6'>
          <CustomerTickets
            experienceId={experienceId}
            accessLevel={accessLevel}
            companyId={companyId}
          />
        </div>
      );
  }
};

export default ClientWrapper;
