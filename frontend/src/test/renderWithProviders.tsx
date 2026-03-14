import { type ReactNode } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';

interface AuthState {
  token: string | null;
  user: null;
}

export function makeStore(auth: AuthState = { token: null, user: null }) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth },
  });
}

interface Options {
  token?: string | null;
  initialRoute?: string;
}

export function renderWithProviders(ui: ReactNode, options: Options = {}) {
  const { token = null, initialRoute = '/' } = options;
  const store = makeStore({ token, user: null });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>{ui}</MemoryRouter>
    </Provider>,
  );
}
