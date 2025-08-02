import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';
import { whopSdk } from '@/lib/whop-api';
import { Message as PrismaMessage, User, Agent } from '@prisma/client';
import { sendNewMessageNotifications } from '@/lib/notifications';
import { sendMessageToWebsocket } from '@/lib/websocket';

// Define a type for the message with agent and user included
export type MessageWithRelations = PrismaMessage & {
  user: User | null;
  agent: Agent | null;
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

    const messages: MessageWithRelations[] = await prisma.message.findMany({
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
    const { userId, accessLevel, companyId } = await verifyUser(experienceId);

    // Check if user is admin or the ticket creator
    const isAdmin = accessLevel === 'admin';
    const isCreator = ticket.creatorId === userId;

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { content } = await request.json();

    const full_new_message = await prisma.message.create({
      data: {
        content,
        ticketId: ticketId,
        userId: userId,
      },
      include: {
        user: true,
        agent: true,
      },
    });

    await sendMessageToWebsocket({
      message: full_new_message,
      ticketId,
      experienceId,
      companyId,
      type: 'NEW_MESSAGE',
    });

    // Send centralized notifications (without await, runs asynchronously)
    sendNewMessageNotifications(
      content,
      {
        id: ticket.id,
        title: ticket.title || '',
        creatorId: ticket.creatorId,
      },
      userId,
      companyId,
      experienceId
    );

    return NextResponse.json(
      {
        message: 'Message created successfully',
        data: full_new_message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
