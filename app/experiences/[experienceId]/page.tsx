import { verifyUser } from '@/lib/authentication';
import { prisma } from '@/lib/prisma';
import { whopSdk } from '@/lib/whop-api';
import { redirect } from 'next/navigation';

export default async function HomePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;

  const { accessLevel, userId } = await verifyUser(experienceId);

  // Get the experience from Whop
  const result = await whopSdk.experiences.getExperience({
    experienceId,
  });

  // Get the company from the database
  let company = await prisma.company.findUnique({
    where: {
      id: result.company.id,
    },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        id: result.company.id,
        title: result.company.title,
      },
    });

    // Create three default categories
    await prisma.category.createMany({
      data: [
        {
          name: 'General',
          description: 'Ask questions or get general help about our services.',
          color: '#3B82F6', // blue
          companyId: company.id,
        },
        {
          name: 'Technical Support',
          description: 'Get help with technical issues or troubleshooting.',
          color: '#10B981', // green
          companyId: company.id,
        },
        {
          name: 'Bug Reports',
          description: 'Report bugs or problems you have encountered.',
          color: '#F43F5E', // red
          companyId: company.id,
        },
        {
          name: 'Suggestions',
          description: 'Share your ideas and suggestions for improvements.',
          color: '#F59E0B', // yellow
          companyId: company.id,
        },
      ],
    });

    // Create the default Agent
    await prisma.agent.create({
      data: {
        companyId: company.id,
        agentName: `${company.title}'s Support Agent`,
        welcomeMessage:
          'Thank you for contacting support. How can we help you today?',
        autoMessage:
          'We will get back to you as soon as possible. Thank you for your patience.',
        reminderMessage:
          'Hi! Just checking in on your support ticket. Do you need any additional help?',
        reminderEnabled: true,
        reminderHours: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  const whop_user = await whopSdk.users.getUser({
    userId,
  });

  let user = await prisma.user.findUnique({
    where: {
      id: whop_user.id,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: whop_user.id,
        name: whop_user.name,
        username: whop_user.username,
        avatarUrl: whop_user.profilePicture?.sourceUrl,
        createdAt: new Date(),
      },
    });
  }

  redirect(`/experiences/${experienceId}/customer`);
}
