import { verifyUser } from '@/lib/authentication';
import ChatPage from './components/chat-page';

export default async function CustomerPortalPage({
  params,
}: {
  params: Promise<{ experienceId: string; ticketId: string }>;
}) {
  const { experienceId, ticketId } = await params;
  const { accessLevel, companyId, username, userId } =
    await verifyUser(experienceId);

  return (
    <ChatPage
      accessLevel={accessLevel}
      experienceId={experienceId}
      companyId={companyId}
      ticketId={ticketId}
      username={username}
      userId={userId}
    />
  );
}
