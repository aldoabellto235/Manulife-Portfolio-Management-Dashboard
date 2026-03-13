import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
import { portfolioApi } from '@/features/portfolio/api/portfolioApi';
import type {
  TransactionsResponse,
  TransactionResponse,
  AddTransactionRequest,
} from '../types';

export const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Transaction'],
  endpoints: (builder) => ({
    getTransactions: builder.query<
      TransactionsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) =>
        `/transactions?page=${page}&limit=${limit}`,
      providesTags: ['Transaction'],
    }),

    addTransaction: builder.mutation<TransactionResponse, AddTransactionRequest>({
      query: (body) => ({ url: '/transactions', method: 'POST', body }),
      invalidatesTags: ['Transaction'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(portfolioApi.util.invalidateTags(['Portfolio', 'Investment']));
      },
    }),

    deleteTransaction: builder.mutation<void, string>({
      query: (id) => ({ url: `/transactions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Transaction'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(portfolioApi.util.invalidateTags(['Portfolio', 'Investment']));
      },
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useDeleteTransactionMutation,
} = transactionsApi;
