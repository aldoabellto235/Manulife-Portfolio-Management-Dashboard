import { describe, it, expect, beforeEach, vi } from 'vitest';

const TOKEN_KEY = 'auth_token';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe('authSlice — localStorage initial state', () => {
  it('initialises with null token when localStorage is empty', async () => {
    const { default: authReducer } = await import('./authSlice');
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state.token).toBeNull();
  });

  it('initialises token from localStorage when a stored token exists', async () => {
    localStorage.setItem(TOKEN_KEY, 'persisted-token');
    const { default: authReducer } = await import('./authSlice');
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state.token).toBe('persisted-token');
  });

  it('initialises with null user regardless of localStorage', async () => {
    localStorage.setItem(TOKEN_KEY, 'some-token');
    const { default: authReducer } = await import('./authSlice');
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state.user).toBeNull();
  });
});
