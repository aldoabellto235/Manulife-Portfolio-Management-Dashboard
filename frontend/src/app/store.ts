import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '@/features/auth/api/authApi';
import { portfolioApi } from '@/features/portfolio/api/portfolioApi';
import { transactionsApi } from '@/features/transactions/api/transactionsApi';
import authReducer from '@/features/auth/store/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [portfolioApi.reducerPath]: portfolioApi.reducer,
    [transactionsApi.reducerPath]: transactionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(portfolioApi.middleware)
      .concat(transactionsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
