import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCustomer } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        experienceId,
      },
      include: {
        ticket: {
          select: {
            title: true,
            description: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentCustomer();
    const { ticketId, rating, feedback } = await request.json();

    // Verify the ticket belongs to the user
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        // creatorId: user.id,
        // status: 'CLOSED',
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found or not closed' },
        { status: 404 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { ticketId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already submitted' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating,
        feedback,
        ticketId,
        userId: user.id,
        username: user.name,
        experienceId: ticket.experienceId,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
