import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';

export async function GET(request: NextRequest) {
  try {
    const experienceId = request.nextUrl.searchParams.get('experienceId');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '3');
    const offset = (page - 1) * limit;

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this experience
    const { userId } = await verifyUser(experienceId);

    // Get total count for pagination
    const totalTickets = await prisma.ticket.count({
      where: {
        experienceId,
        creatorId: userId,
      },
    });

    const totalPages = Math.ceil(totalTickets / limit);

    const tickets = await prisma.ticket.findMany({
      where: {
        experienceId,
        creatorId: userId,
      },
      include: {
        category: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: [
        { status: 'asc' }, // OPEN first
        { createdAt: 'desc' },
      ],
      skip: offset,
      take: limit,
    });

    return NextResponse.json({
      tickets,
      totalPages,
      currentPage: page,
      totalTickets,
    });
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
