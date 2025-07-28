import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser();
    const experienceId = request.nextUrl.searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    let settings = await prisma.settings.findUnique({
      where: {
        experienceId_userId: {
          experienceId,
          userId: user.id,
        },
      },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.settings.create({
        data: {
          experienceId,
          userId: user.id,
          agentName: 'Support Team',
          welcomeMessage: 'Welcome to our support! How can we help you today?',
          autoMessage:
            "Thank you for your message. We'll get back to you shortly.",
          reminderMessage:
            'Hi! Just checking in on your support ticket. Do you need any additional help?',
          reminderEnabled: true,
          reminderHours: 12,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getCurrentUser();
    const experienceId = request.nextUrl.searchParams.get('experienceId');
    const data = await request.json();

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.upsert({
      where: {
        experienceId_userId: {
          experienceId,
          userId: user.id,
        },
      },
      update: {
        agentName: data.agentName,
        welcomeMessage: data.welcomeMessage,
        autoMessage: data.autoMessage,
        reminderMessage: data.reminderMessage,
        reminderEnabled: data.reminderEnabled,
        reminderHours: data.reminderHours,
      },
      create: {
        experienceId,
        userId: user.id,
        agentName: data.agentName,
        welcomeMessage: data.welcomeMessage,
        autoMessage: data.autoMessage,
        reminderMessage: data.reminderMessage,
        reminderEnabled: data.reminderEnabled,
        reminderHours: data.reminderHours,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
