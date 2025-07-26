import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUser();

    if (user.role !== 'CREATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const ticket = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error closing ticket:', error);
    return NextResponse.json(
      { error: 'Failed to close ticket' },
      { status: 500 }
    );
  }
}
