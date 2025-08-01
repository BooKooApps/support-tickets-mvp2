import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const ticket = await prisma.ticket.update({
      where: { id: id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
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

    return NextResponse.json({ ticket, shouldShowReviewDialog });
  } catch (error) {
    console.error('Error closing ticket:', error);
    return NextResponse.json(
      { error: 'Failed to close ticket' },
      { status: 500 }
    );
  }
}
