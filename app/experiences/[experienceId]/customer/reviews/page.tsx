import { verifyUser } from '@/lib/authentication';
import ReviewsPage from './components/reviews-page';

const page = async ({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) => {
  const { experienceId } = await params;
  const { accessLevel, userId, companyId } = await verifyUser(experienceId);

  return (
    <div>
      <ReviewsPage experienceId={experienceId} currentUserId={userId} />
    </div>
  );
};

export default page;
