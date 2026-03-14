import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, { setToken, setUser, clearAuth } from './authSlice';
import type { User } from '../types';

const TOKEN_KEY = 'auth_token';

const emptyState = { token: null, user: null };

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  localStorage.clear();
});

describe('authSlice — setToken', () => {
  it('stores token in state', () => {
    const state = authReducer(emptyState, setToken('my-token'));
    expect(state.token).toBe('my-token');
  });

  it('persists token to localStorage', () => {
    authReducer(emptyState, setToken('my-token'));
    expect(localStorage.getItem(TOKEN_KEY)).toBe('my-token');
  });
});

describe('authSlice — setUser', () => {
  it('stores user in state', () => {
    const state = authReducer(emptyState, setUser(mockUser));
    expect(state.user).toEqual(mockUser);
  });

  it('does not affect token', () => {
    const withToken = { token: 'abc', user: null };
    const state = authReducer(withToken, setUser(mockUser));
    expect(state.token).toBe('abc');
  });
});

describe('authSlice — clearAuth', () => {
  it('clears token from state', () => {
    const withToken = { token: 'abc', user: mockUser };
    const state = authReducer(withToken, clearAuth());
    expect(state.token).toBeNull();
  });

  it('clears user from state', () => {
    const withUser = { token: 'abc', user: mockUser };
    const state = authReducer(withUser, clearAuth());
    expect(state.user).toBeNull();
  });

  it('removes token from localStorage', () => {
    localStorage.setItem(TOKEN_KEY, 'abc');
    authReducer({ token: 'abc', user: null }, clearAuth());
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});

describe('authSlice — plain action dispatch (auth/clearAuth)', () => {
  it('responds to plain string action type used by baseQuery', () => {
    const withToken = { token: 'abc', user: mockUser };
    const state = authReducer(withToken, { type: 'auth/clearAuth' });
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
