import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';
import { getCurrentCustomer } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const experienceId = request.nextUrl.searchParams.get('experienceId');
    const user = getCurrentCustomer();

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        experienceId,
        creatorId: user.id,
      },
      include: {
        category: true,
        review: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, categoryId } = await request.json();
    const experienceId = request.nextUrl.searchParams.get('experienceId') || '';
    const { userId, username } = await verifyUser(experienceId);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        creatorId: userId,
        username: username,
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
        username: username,
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
