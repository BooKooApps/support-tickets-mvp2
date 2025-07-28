import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { verifyUser } from '@/lib/authentication';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // verify it ticket exists and is open
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        id: params.id,
        status: 'OPEN',
      },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const { username, userId, accessLevel } = await verifyUser(
      existingTicket.experienceId
    );

    if (accessLevel !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const ticket = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        status: 'CLAIMED',
        agentId: userId,
        claimedAt: new Date(),
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error claiming ticket:', error);
    return NextResponse.json(
      { error: 'Failed to claim ticket' },
      { status: 500 }
    );
  }
}
