import { verifyUser } from '@/lib/authentication';
import ReviewsPage from './components/reviews-page';
import { prisma } from '@/lib/prisma';

const page = async ({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) => {
  const { experienceId } = await params;
  const { accessLevel, userId, companyId } = await verifyUser(experienceId);

  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
  });

  console.log('company', company);

  return (
    <div>
      <ReviewsPage
        accessLevel={accessLevel}
        experienceId={experienceId}
        currentUserId={userId}
        companyTitle={company?.title || ''}
        companyId={companyId}
      />
    </div>
  );
};

export default page;
