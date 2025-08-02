import { MessageWithRelations } from '@/app/api/tickets/[id]/messages/route';
import { TicketWithRelations } from '@/app/experiences/[experienceId]/customer/components/customer-tickets';
import { whopSdk } from './whop-api';

export const sendMessageToWebsocket = async ({
  message,
  ticketId,
  experienceId,
  companyId,
  type,
}: {
  message: MessageWithRelations | { username: string; userId: string }; //can be the typing username
  ticketId: string;
  experienceId: string;
  companyId: string;
  type:
    | 'NEW_MESSAGE'
    | 'TICKET_CLAIMED'
    | 'TICKET_CLOSED'
    | 'USER_TYPING'
    | 'USER_STOP_TYPING';
}) => {
  if (!experienceId) {
    console.error('Experience ID is not set - websocket message not sent');
    return;
  }

  try {
    // Send websocket message with ticket-specific identifier
    const websocketMessage: WebsocketMessage = {
      type,
      ticketId,
      data: message,
      companyId,
    };

    await whopSdk.websockets.sendMessage({
      target: { experience: experienceId },
      message: JSON.stringify(websocketMessage),
    });

    console.log(`Websocket message sent for ticket ${ticketId}`);
  } catch (error) {
    console.error('Failed to send websocket message:', error);
    // Don't throw the error to avoid failing the message creation
  }
};

export type WebsocketMessage = {
  type:
    | 'NEW_MESSAGE'
    | 'TICKET_CLAIMED'
    | 'TICKET_CLOSED'
    | 'USER_TYPING'
    | 'USER_STOP_TYPING';
  ticketId: string;
  data: MessageWithRelations | { username: string; userId: string };
  companyId: string;
};

export const sendTicketToWebsocket = async (
  ticket: TicketWithRelations,
  experienceId: string,
  companyId: string,
  type: 'NEW_TICKET' | 'TICKET_CLAIMED' | 'TICKET_CLOSED'
) => {
  if (!experienceId) {
    console.error(
      'Experience ID is not set - websocket ticket notification not sent'
    );
    return;
  }

  try {
    // Send websocket message for new ticket
    const websocketMessage: WebsocketMessage = {
      type,
      companyId,
      data: ticket,
      ticketId: ticket.id,
    };

    await whopSdk.websockets.sendMessage({
      target: { experience: experienceId },
      message: JSON.stringify(websocketMessage),
    });

    console.log(`Websocket notification sent for new ticket ${ticket?.id}`);
  } catch (error) {
    console.error('Failed to send websocket ticket notification:', error);
    // Don't throw the error to avoid failing the ticket creation
  }
};
