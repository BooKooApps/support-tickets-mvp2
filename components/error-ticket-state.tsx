export const ErrorTicketState = ({ error }: { error: string }) => {
  return (
    <div className='text-center py-12'>
      <div className='text-destructive text-lg mb-2'>Error loading tickets</div>
      <div className='text-muted-foreground text-sm'>{error}</div>
    </div>
  );
};
