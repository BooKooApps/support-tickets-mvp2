import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTicketToWebsocket } from '../../route';
import { sendTicketClosedNotifications } from '@/lib/notifications';
import { sendMessageToWebsocket } from '../messages/route';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;
  const experienceId = request.nextUrl.searchParams.get('experienceId');

  if (!experienceId) {
    return NextResponse.json(
      { error: 'Experience ID is required' },
      { status: 400 }
    );
  }

  try {
    // verify it ticket exists
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
      },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    const companyAgent = await prisma.agent.findFirst({
      where: {
        companyId: ticket.companyId,
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
        content:
          'We have closed your ticket. If you have any further questions, please feel free to open a new ticket.',
        ticketId: ticket.id,
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
      companyId: ticket.companyId,
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

    // check if the user already has a review for this company
    const existingReview = await prisma.review.findFirst({
      where: { userId: ticket.creatorId, companyId: ticket.companyId },
    });

    let shouldShowReviewDialog = false;

    if (!existingReview) {
      shouldShowReviewDialog = true;
    }

    if (!fullTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // send websocket message to the client
    await sendTicketToWebsocket(
      fullTicket,
      experienceId,
      ticket.companyId,
      'TICKET_CLOSED'
    );

    const company = await prisma.company.findUnique({
      where: {
        id: ticket.companyId,
      },
    });

    // Send centralized notifications
    sendTicketClosedNotifications(
      {
        id: ticket.id,
        title: fullTicket?.title || '',
        creatorId: ticket.creatorId,
      },
      {
        id: ticket.companyId,
        title: company?.title || '',
      },
      experienceId
    );

    return NextResponse.json(
      {
        message: 'Ticket closed successfully',
        ticket: fullTicket,
        shouldShowReviewDialog,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error closing ticket:', error);
    return NextResponse.json(
      { error: 'Failed to close ticket' },
      { status: 500 }
    );
  }
}
