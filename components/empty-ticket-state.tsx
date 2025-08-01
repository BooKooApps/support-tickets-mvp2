export const EmptyTicketState = ({
  accessLevel,
}: {
  accessLevel: 'admin' | 'customer';
}) => {
  return (
    <div className='text-center py-12'>
      <div className=' text-lg mb-2'>No support tickets yet</div>
      <div className='text-muted-foreground text-sm'>
        {accessLevel === 'admin'
          ? 'You will get notified when a new ticket is created'
          : 'Click "Create Ticket" above to get started'}
      </div>
    </div>
  );
};
