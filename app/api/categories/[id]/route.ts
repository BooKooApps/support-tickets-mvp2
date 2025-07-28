import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, color, experienceId } = body;

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id,
        experienceId, // Ensure the category belongs to the correct experience
      },
      data: {
        name,
        description,
        color,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    // Check if category is being used by any tickets
    const ticketsUsingCategory = await prisma.ticket.findFirst({
      where: {
        categoryId: id,
        experienceId, // Ensure we're checking tickets from the same experience
      },
    });

    if (ticketsUsingCategory) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used by tickets' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: {
        id,
        experienceId, // Ensure the category belongs to the correct experience
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
