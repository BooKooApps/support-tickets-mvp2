import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await prisma.message.findMany({
      where: { ticketId: params.id },
      orderBy: { createdAt: 'asc' },
    });

    // Transform messages to include sender info (mock data for demo)
    const messagesWithSender = messages.map(message => ({
      ...message,
      sender: {
        id: message.senderId,
        name:
          message.senderId === 'creator-1' ? 'John Creator' : 'Jane Customer',
        role: message.senderId === 'creator-1' ? 'CREATOR' : 'USER',
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
    const user = getCurrentUser();
    const { content } = await request.json();

    const message = await prisma.message.create({
      data: {
        content,
        ticketId: params.id,
        senderId: user.id,
      },
    });

    // Transform message to include sender info (mock data for demo)
    const messageWithSender = {
      ...message,
      sender: {
        id: message.senderId,
        name:
          message.senderId === 'creator-1' ? 'John Creator' : 'Jane Customer',
        role: message.senderId === 'creator-1' ? 'CREATOR' : 'USER',
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
