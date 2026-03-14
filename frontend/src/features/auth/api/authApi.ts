import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  LoginRequest,
  RegisterRequest,
  AuthTokenResponse,
  MeResponse,
  LogoutResponse,
} from '../types';
import { createAuthBaseQuery } from '@/shared/api/baseQuery';

const basicAuth = btoa(
  `${import.meta.env.VITE_BASIC_AUTH_USER}:${import.meta.env.VITE_BASIC_AUTH_PASSWORD}`
);

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: createAuthBaseQuery(import.meta.env.VITE_API_BASE_URL),
  endpoints: (builder) => ({
    login: builder.mutation<AuthTokenResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
        headers: { Authorization: `Basic ${basicAuth}` },
      }),
    }),

    register: builder.mutation<AuthTokenResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
        headers: { Authorization: `Basic ${basicAuth}` },
      }),
    }),

    getMe: builder.query<MeResponse, void>({
      query: () => '/auth/me',
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
