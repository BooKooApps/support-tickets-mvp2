import { CustomerTickets } from '@/app/experiences/[experienceId]/customer/components/customer-tickets';
import { CreateTicketDialog } from './components/create-ticket-dialog';
import { Ticket } from 'lucide-react';

export default function CustomerPortalPage({
  params,
}: {
  params: { experienceId: string };
}) {
  return (
    <div className='space-y-6'>
    

      <CustomerTickets experienceId={params.experienceId} />
    </div>
  );
}
