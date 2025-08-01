import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';
import { Prisma } from '@prisma/client';

// GET /api/tickets/closed?experienceId=...
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
    const { userId, companyId, accessLevel } = await verifyUser(experienceId);
    const isUserAdmin = accessLevel === 'admin';
    const ticketsWhereClause: Prisma.TicketWhereInput = isUserAdmin
      ? {
          companyId,
          status: {
            in: ['CLOSED'],
          },
        }
      : {
          companyId,
          creatorId: userId,
          status: {
            in: ['CLOSED'],
          },
        };

    // Get total count for pagination
    const totalTickets = await prisma.ticket.count({
      where: ticketsWhereClause,
    });

    const totalPages = Math.ceil(totalTickets / limit);

    const tickets = await prisma.ticket.findMany({
      where: ticketsWhereClause,
      include: {
        category: true,
        creator: {
          select: {
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
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
