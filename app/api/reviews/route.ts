import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';

import type { Review as PrismaReview, User } from '@prisma/client';

export type ReviewResponse = PrismaReview & {
  user: User;
};

// api/reviews?experienceId=123&userOnly=true&page=1&limit=10
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');
    const userOnly = searchParams.get('userOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this experience
    const { userId, companyId } = await verifyUser(experienceId);

    const whereClause: any = {
      companyId,
    };

    // If userOnly is true, filter by the current user's reviews
    if (userOnly) {
      whereClause.userId = userId;
    }

    // Calculate offset for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCount = await prisma.review.count({
      where: whereClause,
    });

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      reviews: reviews as ReviewResponse[],
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
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
      include: {
        creator: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found or not closed' },
        { status: 404 }
      );
    }

    // Check if user already has a review for this company
    const existingReview = await prisma.review.findFirst({
      where: { userId: ticket.creator.id, companyId: ticket.companyId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this company' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating,
        feedback,
        userId: ticket.creator.id,
        companyId: ticket.companyId,
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
        user: true,
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        feedback,
      },
      include: {
        user: true,
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
