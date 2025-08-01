import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { differenceInSeconds } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search
      ? {
          title: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    // Get total count for pagination
    const totalCompanies = await prisma.company.count({
      where: whereClause,
    });

    // Fetch companies with their reviews
    const companies = await prisma.company.findMany({
      where: whereClause,
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      skip,
      take: limit,
    });

    // Calculate stats for each company and get response times
    const companiesWithStats = await Promise.all(
      companies.map(async company => {
        const totalReviews = company._count.reviews;
        const avgRating =
          totalReviews > 0
            ? company.reviews.reduce((acc, review) => acc + review.rating, 0) /
              totalReviews
            : 0;
        const avgResponseTime = await getAverageResponseTime(company.id);

        return {
          id: company.id,
          title: company.title,
          avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
          totalReviews,
          avgResponseTime: Math.round(avgResponseTime), // Round to nearest second
        };
      })
    );

    // Sort by ranking criteria: first by total reviews (desc), then by avg rating (desc)
    const sortedCompanies = companiesWithStats.sort((a, b) => {
      if (b.totalReviews !== a.totalReviews) {
        return b.totalReviews - a.totalReviews;
      }
      return b.avgRating - a.avgRating;
    });

    return NextResponse.json({
      companies: sortedCompanies,
      pagination: {
        page,
        limit,
        total: totalCompanies,
        totalPages: Math.ceil(totalCompanies / limit),
        hasNext: page < Math.ceil(totalCompanies / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching companies leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies leaderboard' },
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
