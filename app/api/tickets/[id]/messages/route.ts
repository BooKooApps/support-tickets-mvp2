import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';
import { whopSdk } from '@/lib/whop-api';

// Define a type for the message with agent and user included
export type MessageWithAgentAndUser = Awaited<
  ReturnType<typeof prisma.message.findFirst>
> & {
  user: Awaited<ReturnType<typeof prisma.user.findFirst>> | null;
  agent: Awaited<ReturnType<typeof prisma.agent.findFirst>> | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;
  const { searchParams } = new URL(request.url);
  const experienceId = searchParams.get('experienceId');

  if (!experienceId) {
    return NextResponse.json(
      { error: 'Experience ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get the ticket to verify access
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Verify user has access to this experience
    const { userId, accessLevel } = await verifyUser(experienceId);

    // Check if user is admin or the ticket creator
    const isAdmin = accessLevel === 'admin';
    const isCreator = ticket.creatorId === userId;

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const messages: MessageWithAgentAndUser[] = await prisma.message.findMany({
      where: { ticketId: ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: true,
        agent: true,
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;

  try {
    // Get the ticket to verify access
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Verify user has access to this experience
    const { userId, username, accessLevel } = await verifyUser(
      ticket.experienceId
    );

    // Check if user is admin or the ticket creator
    const isAdmin = accessLevel === 'admin';
    const isCreator = ticket.creatorId === userId;

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { content } = await request.json();

    const message = await prisma.message.create({
      data: {
        content,
        ticketId: ticketId,
        senderId: userId,
        username: username,
      },
    });

    // Transform message to include sender info
    const messageWithSender = {
      ...message,
      sender: {
        id: message.senderId,
        name: message.username || 'Unknown User',
        role: message.senderId === ticket.creatorId ? 'USER' : 'CREATOR',
      },
    };

    await sendMessageToWebsocket(
      messageWithSender,
      ticketId,
      ticket.experienceId
    );

    return NextResponse.json(messageWithSender);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
const sendMessageToWebsocket = async (
  message: any,
  ticketId: string,
  experienceId: string
) => {
  if (!experienceId) {
    console.error('Experience ID is not set - websocket message not sent');
    return;
  }

  try {
    // Send websocket message with ticket-specific identifier
    const websocketMessage = {
      type: 'NEW_MESSAGE',
      ticketId,
      data: message,
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
