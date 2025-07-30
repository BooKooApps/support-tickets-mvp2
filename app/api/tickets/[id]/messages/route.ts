import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the ticket to verify access
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
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

    const messages = await prisma.message.findMany({
      where: { ticketId: params.id },
      orderBy: { createdAt: 'asc' },
    });

    // Transform messages to include sender info
    const messagesWithSender = messages.map(message => ({
      ...message,
      sender: {
        id: message.senderId,
        name: message.username || 'Unknown User',
        role: message.senderId === ticket.creatorId ? 'USER' : 'CREATOR',
      },
    }));

    return NextResponse.json(messagesWithSender);
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
  { params }: { params: { id: string } }
) {
  try {
    // Get the ticket to verify access
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
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
        ticketId: params.id,
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

    return NextResponse.json(messageWithSender);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
