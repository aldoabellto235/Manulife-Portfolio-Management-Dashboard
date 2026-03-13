import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
import type {
  LoginRequest,
  RegisterRequest,
  AuthTokenResponse,
  MeResponse,
  LogoutResponse,
} from '../types';

const basicAuth = btoa(
  `${import.meta.env.VITE_BASIC_AUTH_USER}:${import.meta.env.VITE_BASIC_AUTH_PASSWORD}`
);

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
