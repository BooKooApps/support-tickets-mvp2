import { verifyUser } from '@/lib/authentication';
import { prisma } from '@/lib/prisma';
import { whopSdk } from '@/lib/whop-api';
import { User } from '@prisma/client';
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

  let userRole = await prisma.userRole.findFirst({
    where: {
      userId: user.id,
      companyId: company.id,
    },
  });

  if (!userRole) {
    userRole = await prisma.userRole.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: accessLevel,
      },
    });
  }

  if (userRole.role !== accessLevel) {
    await prisma.userRole.update({
      where: {
        id: userRole.id,
      },
      data: {
        role: accessLevel,
      },
    });
  }

  await updateUserInfo(user, whop_user as any);

  redirect(`/experiences/${experienceId}/customer?tab=TICKETS`);
}

const updateUserInfo = async (
  user: User,
  whopUser: {
    id: string;
    name: string;
    username: string;
    profilePicture: {
      sourceUrl: string;
    };
  }
) => {
  if (user.avatarUrl !== whopUser.profilePicture?.sourceUrl) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarUrl: whopUser.profilePicture?.sourceUrl,
      },
    });
  }

  if (user.name !== whopUser.name) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: whopUser.name,
      },
    });
  }

  if (user.username !== whopUser.username) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        username: whopUser.username,
      },
    });
  }
};
