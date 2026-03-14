import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '@/app/store';

/**
 * Wraps fetchBaseQuery with automatic 401 handling.
 * If a request fails with 401 AND a token was present, the auth state is cleared
 * so ProtectedRoute redirects to /login.
 * Login/register 401s (wrong credentials, no token) are left untouched.
 *
 * Uses plain action dispatch to avoid circular dependency:
 * baseQuery → authSlice → authApi → baseQuery
 */
export const createAuthBaseQuery = (
  baseUrl: string,
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const base = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    const result = await base(args, api, extraOptions);
    if (result.error?.status === 401) {
      const token = (api.getState() as RootState).auth.token;
      if (token) {
        // Dispatch plain action to avoid circular import with authSlice
        api.dispatch({ type: 'auth/clearAuth' });
      }
    }
    return result;
  };
};
