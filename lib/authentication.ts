'use server';

import { verifyUserToken } from '@whop/api';
import { whopSdk } from './whop-api';
import { headers } from 'next/headers';
import { cache } from 'react';

export const verifyUser = cache(
  async (
    experienceId: string,
    requiredAccessLevel?: 'admin'
  ): Promise<{
    userId: string;
    username: string;
    companyId: string;
    accessLevel: 'admin' | 'customer';
  }> => {
    const headersList = await headers();

    const { userId } = await verifyUserToken(headersList);

    const { username } = await whopSdk.users.getUser({
      userId,
    });

    const experience = await whopSdk.experiences.getExperience({
      experienceId,
    });

    const companyId = experience.company.id;

    const hasAccessToExperience =
      await whopSdk.access.checkIfUserHasAccessToExperience({
        experienceId,
        userId,
      });

    if (
      requiredAccessLevel &&
      hasAccessToExperience.accessLevel !== requiredAccessLevel
    ) {
      throw new Error('User must be admin to access this experience');
    }

    if (hasAccessToExperience.accessLevel === 'no_access') {
      throw new Error('User does not have access to this experience');
    }

    return {
      userId,
      username,
      companyId,
      accessLevel: hasAccessToExperience.accessLevel,
    };
  }
);
