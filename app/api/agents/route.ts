import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUser } from '@/lib/authentication';
import { Agent } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const experienceId = request.nextUrl.searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    // Verify user has admin access to this experience
    const { userId, accessLevel, companyId } = await verifyUser(experienceId);

    if (accessLevel !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can access settings' },
        { status: 403 }
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

    const agent: Agent | null = await prisma.agent.findFirst({
      where: {
        companyId,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const experienceId = request.nextUrl.searchParams.get('experienceId');
    const { agentName, autoMessage, id } = await request.json();

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    // Verify user has admin access to this experience
    const { accessLevel, companyId } = await verifyUser(experienceId);

    if (accessLevel !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update settings' },
        { status: 403 }
      );
    }

    const agent = await prisma.agent.update({
      where: {
        companyId,
        id,
      },
      data: {
        agentName,
        autoMessage,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}
