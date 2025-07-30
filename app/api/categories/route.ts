import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';

export async function GET(request: NextRequest) {
  try {
    const experienceId = request.nextUrl.searchParams.get('experienceId') || '';

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this experience
    await verifyUser(experienceId);

    const categories = await prisma.category.findMany({
      where: { experienceId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, experienceId } = body;

    if (!name || !experienceId) {
      return NextResponse.json(
        { error: 'Name and experienceId are required' },
        { status: 400 }
      );
    }

    // Verify user has admin access to this experience
    const { accessLevel } = await verifyUser(experienceId);

    if (accessLevel !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create categories' },
        { status: 403 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color: color || '#3B82F6',
        experienceId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
