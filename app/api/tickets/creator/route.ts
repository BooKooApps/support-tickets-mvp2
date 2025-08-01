import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';

// GET /api/tickets/creator?experienceId=...
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

    const { userId, companyId, accessLevel } = await verifyUser(experienceId);

    // Only admins (creators) can access this endpoint
    if (accessLevel !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get total count for pagination
    const totalTickets = await prisma.ticket.count({
      where: {
        companyId,
      },
    });

    const totalPages = Math.ceil(totalTickets / limit);

    const tickets = await prisma.ticket.findMany({
      where: {
        companyId: companyId,
        status: {
          in: ['OPEN', 'CLAIMED'],
        },
      },
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
        { status: 'asc' }, // OPEN first, then CLAIMED
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
    console.error('Error fetching creator tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
