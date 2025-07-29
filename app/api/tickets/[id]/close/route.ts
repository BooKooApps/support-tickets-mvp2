import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // verify it ticket exists
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        id: id,
      },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const { accessLevel } = await verifyUser(existingTicket.experienceId);

    if (accessLevel !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const ticket = await prisma.ticket.update({
      where: { id: id },
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
