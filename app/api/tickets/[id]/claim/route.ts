import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTicketToWebsocket } from '../../route';

// api/tickets/[id]/claim/route.ts
// This route is used to claim a ticket
// It updates the ticket status to claimed and sends a websocket message to the client
// It also returns the full ticket with relations for the client to use
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: ticketId } = await params;
  const experienceId = request.nextUrl.searchParams.get('experienceId');

  try {
    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    // verify it ticket exists and is open
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        status: 'OPEN',
      },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'CLAIMED',
        claimedAt: new Date(),
      },
    });

    const fullTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
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
    });

    if (!fullTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Send websocket message to the client
    await sendTicketToWebsocket(
      fullTicket,
      experienceId,
      existingTicket.companyId,
      'TICKET_CLAIMED'
    );

    return NextResponse.json(
      {
        message: 'Ticket claimed successfully',
        ticket: fullTicket,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error claiming ticket:', error);
    return NextResponse.json(
      { error: 'Failed to claim ticket' },
      { status: 500 }
    );
  }
}
