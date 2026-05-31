'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { api, clearTokens, getAccessToken } from '@/lib/api';
import { AppDispatch, RootState } from '@/store';
import { logout as logoutAction, setUser } from '@/store/authSlice';

/** Loads the current user from the API token and guards protected routes. */
export function useAuth(redirectIfUnauthed = true) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      if (redirectIfUnauthed) router.replace('/login');
      return;
    }
    if (!user) {
      api
        .get('/users/me')
        .then((res) =>
          dispatch(
            setUser({
              id: res.data.id,
              tenantId: res.data.tenantId,
              email: res.data.email,
              roles: res.data.roles || [],
              permissions: [],
            }),
          ),
        )
        .catch(() => {
          clearTokens();
          if (redirectIfUnauthed) router.replace('/login');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    clearTokens();
    dispatch(logoutAction());
    router.replace('/login');
  };

  return { user, logout };
}
