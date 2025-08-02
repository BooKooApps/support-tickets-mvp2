import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMessageToWebsocket, sendTicketToWebsocket } from '@/lib/websocket';
import { sendTicketClaimedNotifications } from '@/lib/notifications';
import { verifyUser } from '@/lib/authentication';

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

    const { username, userId, companyId } = await verifyUser(experienceId);

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

    const companyAgent = await prisma.agent.findFirst({
      where: {
        companyId: existingTicket.companyId,
      },
    });

    if (!companyAgent) {
      return NextResponse.json(
        { error: 'No agent found for this company' },
        { status: 404 }
      );
    }

    // send message via agent to the customer
    const agentMessage = await prisma.message.create({
      data: {
        content: `This ticket has been claimed by ${username}`,
        ticketId: existingTicket.id,
        agentId: companyAgent.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        agent: true,
        user: true,
      },
    });

    await sendMessageToWebsocket({
      message: agentMessage,
      ticketId,
      experienceId,
      companyId: existingTicket.companyId,
      type: 'NEW_MESSAGE',
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

    const company = await prisma.company.findUnique({
      where: {
        id: existingTicket.companyId,
      },
    });

    // Send centralized notifications
    sendTicketClaimedNotifications(
      {
        id: ticketId,
        title: fullTicket?.title || '',
        creatorId: existingTicket.creatorId,
      },
      {
        id: existingTicket.companyId,
        title: company?.title || '',
      },
      experienceId
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
