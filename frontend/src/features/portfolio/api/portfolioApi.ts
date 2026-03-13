import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
import type {
  PortfolioResponse,
  InvestmentsResponse,
  AssetResponse,
  AddInvestmentRequest,
  UpdateInvestmentRequest,
} from '../types';

export const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
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
  tagTypes: ['Portfolio', 'Investment'],
  endpoints: (builder) => ({
    getPortfolio: builder.query<PortfolioResponse, void>({
      query: () => '/portfolio',
      providesTags: ['Portfolio'],
    }),

    getInvestments: builder.query<InvestmentsResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 50 } = {}) =>
        `/investments?page=${page}&limit=${limit}`,
      providesTags: ['Investment'],
    }),

    addInvestment: builder.mutation<AssetResponse, AddInvestmentRequest>({
      query: (body) => ({
        url: '/investments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Portfolio', 'Investment'],
    }),

    updateInvestment: builder.mutation<
      AssetResponse,
      { id: string; body: UpdateInvestmentRequest }
    >({
      query: ({ id, body }) => ({
        url: `/investments/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Portfolio', 'Investment'],
    }),

    deleteInvestment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/investments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Portfolio', 'Investment'],
    }),
  }),
});

export const {
  useGetPortfolioQuery,
  useGetInvestmentsQuery,
  useAddInvestmentMutation,
  useUpdateInvestmentMutation,
  useDeleteInvestmentMutation,
} = portfolioApi;
