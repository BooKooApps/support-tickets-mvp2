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
        status: 'CLAIMED',
        agentId: user.id,
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
