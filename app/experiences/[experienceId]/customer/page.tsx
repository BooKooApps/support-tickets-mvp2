import { verifyUser } from '@/lib/authentication';
import ClientWrapper from './components/client-wrapper';
import { prisma } from '@/lib/prisma';

export default async function CustomerPortalPage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  const { accessLevel, companyId, userId } = await verifyUser(experienceId);

  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
  });

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <ClientWrapper
      experienceId={experienceId}
      accessLevel={accessLevel}
      company={company}
      userId={userId}
      companyId={companyId}
    />
  );
}
