import { verifyUser } from '@/lib/authentication';
import React from 'react';
import WhopLeadboardPage from './components/whop-leadboard-page';

const page = async ({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) => {
  const { experienceId } = await params;
  const { accessLevel, companyId } = await verifyUser(experienceId);

  return (
    <WhopLeadboardPage
      experienceId={experienceId}
      companyId={companyId}
      accessLevel={accessLevel}
    />
  );
};

export default page;
