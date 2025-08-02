import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Review as PrismaReview, User } from '@prisma/client';
import { differenceInSeconds } from 'date-fns';

// api/reviews/[companyId]/stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params; // companyId is the experienceId

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        companyId,
      },
    });

    const avgRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    const totalReviews = reviews.length;
    const avgResponseTime = await getAverageResponseTime(companyId);

    return NextResponse.json({
      avgRating,
      totalReviews,
      avgResponseTime,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

async function getAverageResponseTime(companyId: string) {
  // 1. Buscar todos os tickets da empresa
  const tickets = await prisma.ticket.findMany({
    where: { companyId },
    select: {
      id: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          createdAt: true,
          userId: true,
          agentId: true,
        },
      },
    },
  });

  const responseTimes: number[] = [];

  for (const ticket of tickets) {
    const userMessage = ticket.messages.find(m => m.userId);
    if (!userMessage) continue;

    const agentResponse = ticket.messages.find(
      m => m.agentId && m.createdAt > userMessage.createdAt
    );
    if (!agentResponse) continue;

    const diff = differenceInSeconds(
      agentResponse.createdAt,
      userMessage.createdAt
    );
    responseTimes.push(diff);
  }

  const average =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

  return average; // em segundos
}
