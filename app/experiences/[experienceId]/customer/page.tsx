import { CustomerTickets } from '@/app/experiences/[experienceId]/customer/components/customer-tickets';
import { verifyUser } from '@/lib/authentication';

export default async function CustomerPortalPage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  const { accessLevel, companyId } = await verifyUser(experienceId);

  return (
    <div className='space-y-6'>
      <CustomerTickets
        accessLevel={'customer'}
        experienceId={experienceId}
        companyId={companyId}
      />
    </div>
  );
}
