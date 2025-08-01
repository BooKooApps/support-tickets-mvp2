import { verifyUser } from '@/lib/authentication';
import { CustomerTickets } from '../customer/components/customer-tickets';

export default async function CreatorTicketsPage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  const { accessLevel, companyId } = await verifyUser(experienceId);

  if (accessLevel !== 'admin') {
    return <div>You are not authorized to access this page</div>;
  }

  return (
    <div className='space-y-6'>
      <CustomerTickets
        accessLevel='admin'
        experienceId={experienceId}
        companyId={companyId}
      />
    </div>
  );
}
