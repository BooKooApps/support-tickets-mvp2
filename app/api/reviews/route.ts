import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');
    const userOnly = searchParams.get('userOnly') === 'true';

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this experience
    const { userId } = await verifyUser(experienceId);

    const whereClause: any = {
      experienceId,
    };

    // If userOnly is true, filter by the current user's reviews
    if (userOnly) {
      whereClause.userId = userId;
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
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
    const { ticketId, rating, feedback } = await request.json();

    // Verify the ticket exists and get its details
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        status: 'CLOSED',
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found or not closed' },
        { status: 404 }
      );
    }

    // Verify user has access to this experience and is the ticket creator
    const { userId, username } = await verifyUser(ticket.experienceId);

    if (ticket.creatorId !== userId) {
      return NextResponse.json(
        { error: 'You can only review your own tickets' },
        { status: 403 }
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
        userId: userId,
        username: username,
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

export async function PUT(request: NextRequest) {
  try {
    const { reviewId, rating, feedback } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Find the existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        ticket: true,
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Verify user has access to this experience and is the review author
    const { userId } = await verifyUser(existingReview.experienceId);

    if (existingReview.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        feedback,
      },
      include: {
        ticket: {
          select: { title: true, category: true },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
