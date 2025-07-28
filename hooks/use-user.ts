'use client';

import { useState, useEffect } from 'react';
import { verifyUser } from '@/lib/authentication';

interface UserInfo {
  userId: string;
  username: string;
  accessLevel: 'admin' | 'customer';
}

interface UseUserReturn {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUser(
  experienceId: string,
  requiredAccessLevel?: 'admin'
): UseUserReturn {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userInfo = await verifyUser(experienceId, requiredAccessLevel);
      setUser(userInfo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch user information'
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (experienceId) {
      fetchUser();
    }
  }, [experienceId, requiredAccessLevel]);

  const refetch = async () => {
    await fetchUser();
  };

  return {
    user,
    loading,
    error,
    refetch,
  };
}
