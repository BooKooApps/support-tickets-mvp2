import { sendMessageToWebsocket } from '@/app/api/tickets/[id]/messages/route';

export async function userTyping({
  isTyping,
  ticketId,
  experienceId,
  companyId,
  username,
  userId,
}: {
  isTyping: boolean;
  ticketId: string;
  experienceId: string;
  companyId: string;
  username: string;
  userId: string;
}) {
  const type = isTyping ? 'USER_TYPING' : 'USER_STOP_TYPING';
  await sendMessageToWebsocket({
    message: {
      username,
      userId,
    },
    ticketId,
    experienceId,
    companyId,
    type,
  });
}
