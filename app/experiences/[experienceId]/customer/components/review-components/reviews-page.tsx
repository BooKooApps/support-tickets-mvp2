'use client';
import { Star } from 'lucide-react';
import ReviewsList from './reviews-list';
import ReviewsStats from './reviews-stats';

// Componente para o cabeçalho da página
const ReviewsHeader = ({ companyTitle }: { companyTitle: string }) => (
  <div className='mb-8'>
    <div className='flex items-center gap-3 mb-2'>
      <Star className='h-6 w-6 text-primary' />
      <h1 className='text-3xl font-bold '>{`${companyTitle}'s Reviews`}</h1>
    </div>
  </div>
);

const ReviewsPage = ({
  accessLevel,
  experienceId,
  currentUserId,
  companyTitle,
  companyId,
}: {
  accessLevel: 'customer' | 'admin';
  experienceId: string;
  currentUserId: string;
  companyTitle: string;
  companyId: string;
}) => {
  return (
    <div>
      {/* header */}
      <ReviewsHeader companyTitle={companyTitle} />

      {/* avg rating, total reviews, avg response time */}
      <ReviewsStats companyId={companyId} />

      {/* customers reviews section */}
      <ReviewsList currentUserId={currentUserId} experienceId={experienceId} />
    </div>
  );
};

export default ReviewsPage;
