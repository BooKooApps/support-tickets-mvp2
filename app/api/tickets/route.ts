import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';

export async function POST(request: NextRequest) {
  try {
    const { title, description, categoryId } = await request.json();
    const experienceId = request.nextUrl.searchParams.get('experienceId') || '';
    const { userId } = await verifyUser(experienceId);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        creatorId: userId,
        categoryId,
        experienceId,
      },
    });

    // Create initial message
    await prisma.message.create({
      data: {
        content: description,
        ticketId: ticket.id,
        senderId: userId,
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
