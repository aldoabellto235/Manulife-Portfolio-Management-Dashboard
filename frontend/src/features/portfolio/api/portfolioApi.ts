import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  PortfolioResponse,
  InvestmentsResponse,
  AssetResponse,
  AddInvestmentRequest,
  UpdateInvestmentRequest,
} from '../types';
import { createAuthBaseQuery } from '@/shared/api/baseQuery';

export const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
  baseQuery: createAuthBaseQuery(import.meta.env.VITE_API_BASE_URL),
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
