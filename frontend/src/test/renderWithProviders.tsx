import { type ReactNode } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import type { User } from '@/features/auth/types';

interface AuthState {
  token: string | null;
  user: User | null;
}

export function makeStore(auth: AuthState = { token: null, user: null }) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth },
  });
}

interface Options {
  token?: string | null;
  user?: User | null;
  initialRoute?: string;
}

export function renderWithProviders(ui: ReactNode, options: Options = {}) {
  const { token = null, user = null, initialRoute = '/' } = options;
  const store = makeStore({ token, user });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>{ui}</MemoryRouter>
    </Provider>,
  );
}
