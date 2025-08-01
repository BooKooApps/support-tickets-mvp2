import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';
import { whopSdk } from '@/lib/whop-api';
import { TicketWithRelations } from '@/app/experiences/[experienceId]/customer/components/customer-tickets';

// GET /api/tickets?experienceId=...
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
    const { userId, companyId } = await verifyUser(experienceId);

    // Get total count for pagination
    const totalTickets = await prisma.ticket.count({
      where: {
        companyId,
        creatorId: userId,
      },
    });

    const totalPages = Math.ceil(totalTickets / limit);

    const tickets = await prisma.ticket.findMany({
      where: {
        companyId,
        creatorId: userId,
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

export async function POST(request: NextRequest) {
  try {
    const { title, description, categoryId } = await request.json();
    const experienceId = request.nextUrl.searchParams.get('experienceId') || '';
    const { userId, companyId } = await verifyUser(experienceId);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        creatorId: userId,
        categoryId,
        companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Fetch the agent from the company
    const agent = await prisma.agent.findFirst({
      where: {
        companyId,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'No agent found for this company' },
        { status: 404 }
      );
    }

    // Create initial message from the agent
    await prisma.message.create({
      data: {
        content: agent.welcomeMessage,
        ticketId: ticket.id,
        agentId: agent.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Get the complete ticket with relations for WebSocket
    const fullTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
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

    // Send WebSocket notification for new ticket
    if (fullTicket) {
      await sendTicketToWebsocket(
        fullTicket,
        experienceId,
        companyId,
        'NEW_TICKET'
      );
    }

    return NextResponse.json(
      {
        message: 'Ticket created successfully',
        ticket: fullTicket,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

export const sendTicketToWebsocket = async (
  ticket: TicketWithRelations,
  experienceId: string,
  companyId: string,
  type: 'NEW_TICKET' | 'TICKET_CLAIMED' | 'TICKET_CLOSED'
) => {
  if (!experienceId) {
    console.error(
      'Experience ID is not set - websocket ticket notification not sent'
    );
    return;
  }

  try {
    // Send websocket message for new ticket
    const websocketMessage = {
      type,
      companyId,
      data: ticket,
    };

    await whopSdk.websockets.sendMessage({
      target: { experience: experienceId },
      message: JSON.stringify(websocketMessage),
    });

    console.log(`Websocket notification sent for new ticket ${ticket?.id}`);
  } catch (error) {
    console.error('Failed to send websocket ticket notification:', error);
    // Don't throw the error to avoid failing the ticket creation
  }
};
