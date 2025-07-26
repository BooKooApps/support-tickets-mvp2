import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCustomer } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentCustomer();
    const { title, description, categoryId } = await request.json();

    // Check if user already has an open ticket
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        creatorId: user.id,
        status: { in: ['OPEN', 'CLAIMED'] },
      },
    });

    if (existingTicket) {
      return NextResponse.json(
        {
          error:
            'You already have an open ticket. Please close it before creating a new one.',
        },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        creatorId: user.id,
        categoryId,
      },
    });

    // Create initial message
    await prisma.message.create({
      data: {
        content: description,
        ticketId: ticket.id,
        senderId: user.id,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
