import { describe, it, expect, beforeEach } from 'vitest';
import authReducer from './authSlice';
import type { User } from '../types';

const TOKEN_KEY = 'auth_token';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
};

const emptyState = { token: null, user: null };

// RTK Query fulfilled action shape for mutations (reducerPath = 'authApi')
function mutationFulfilled(endpointName: string, payload: unknown) {
  return {
    type: 'authApi/executeMutation/fulfilled',
    meta: {
      requestStatus: 'fulfilled' as const,
      arg: { endpointName, type: 'mutation' as const },
      requestId: 'test-request-id',
    },
    payload,
  };
}

// RTK Query fulfilled action shape for queries
function queryFulfilled(endpointName: string, payload: unknown) {
  return {
    type: 'authApi/executeQuery/fulfilled',
    meta: {
      requestStatus: 'fulfilled' as const,
      arg: { endpointName, type: 'query' as const },
      requestId: 'test-request-id',
    },
    payload,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('authSlice extraReducers — login fulfilled', () => {
  it('sets token in state', () => {
    const state = authReducer(
      emptyState,
      mutationFulfilled('login', { data: { accessToken: 'login-token' }, status: 'ok', code: 200 }),
    );
    expect(state.token).toBe('login-token');
  });

  it('persists token to localStorage', () => {
    authReducer(
      emptyState,
      mutationFulfilled('login', { data: { accessToken: 'login-token' }, status: 'ok', code: 200 }),
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBe('login-token');
  });
});

describe('authSlice extraReducers — register fulfilled', () => {
  it('sets token in state', () => {
    const state = authReducer(
      emptyState,
      mutationFulfilled('register', { data: { accessToken: 'reg-token' }, status: 'ok', code: 201 }),
    );
    expect(state.token).toBe('reg-token');
  });

  it('persists token to localStorage', () => {
    authReducer(
      emptyState,
      mutationFulfilled('register', { data: { accessToken: 'reg-token' }, status: 'ok', code: 201 }),
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBe('reg-token');
  });
});

describe('authSlice extraReducers — getMe fulfilled', () => {
  it('sets user in state', () => {
    const state = authReducer(
      { token: 'abc', user: null },
      queryFulfilled('getMe', { data: mockUser, status: 'ok', code: 200 }),
    );
    expect(state.user).toEqual(mockUser);
  });

  it('does not change token', () => {
    const state = authReducer(
      { token: 'abc', user: null },
      queryFulfilled('getMe', { data: mockUser, status: 'ok', code: 200 }),
    );
    expect(state.token).toBe('abc');
  });
});

describe('authSlice extraReducers — logout fulfilled', () => {
  it('clears token from state', () => {
    const state = authReducer(
      { token: 'abc', user: mockUser },
      mutationFulfilled('logout', { data: { message: 'ok' }, status: 'ok', code: 200 }),
    );
    expect(state.token).toBeNull();
  });

  it('clears user from state', () => {
    const state = authReducer(
      { token: 'abc', user: mockUser },
      mutationFulfilled('logout', { data: { message: 'ok' }, status: 'ok', code: 200 }),
    );
    expect(state.user).toBeNull();
  });

  it('removes token from localStorage', () => {
    localStorage.setItem(TOKEN_KEY, 'abc');
    authReducer(
      { token: 'abc', user: mockUser },
      mutationFulfilled('logout', { data: { message: 'ok' }, status: 'ok', code: 200 }),
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
