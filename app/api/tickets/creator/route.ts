import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';

export async function GET(request: NextRequest) {
  try {
    const experienceId = request.nextUrl.searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this experience
    const { accessLevel } = await verifyUser(experienceId);

    // Only admins (creators) can access this endpoint
    if (accessLevel !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        experienceId: experienceId,
        status: {
          in: ['OPEN', 'CLAIMED'],
        },
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
        { status: 'asc' }, // OPEN first, then CLAIMED
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching creator tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
