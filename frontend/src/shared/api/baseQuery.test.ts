import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthBaseQuery } from './baseQuery';

// Minimal api object mock used by RTK Query base queries
function makeApi(token: string | null) {
  const dispatched: unknown[] = [];
  return {
    getState: () => ({ auth: { token } }),
    dispatch: (action: unknown) => dispatched.push(action),
    dispatched,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('createAuthBaseQuery — 401 handling', () => {
  it('dispatches auth/clearAuth when 401 received with a token present', async () => {
    // Mock fetch to return 401
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
        text: async () => JSON.stringify({ message: 'Unauthorized' }),
        headers: { get: () => 'application/json' },
        clone: function () { return this; },
      }),
    );

    const baseQuery = createAuthBaseQuery('http://localhost');
    const api = makeApi('valid-token');

    await baseQuery('/protected', api as never, {});

    expect(api.dispatched).toContainEqual({ type: 'auth/clearAuth' });
  });

  it('does NOT dispatch auth/clearAuth when 401 received without a token (login failure)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
        text: async () => JSON.stringify({ message: 'Invalid credentials' }),
        headers: { get: () => 'application/json' },
        clone: function () { return this; },
      }),
    );

    const baseQuery = createAuthBaseQuery('http://localhost');
    const api = makeApi(null); // no token

    await baseQuery('/auth/login', api as never, {});

    expect(api.dispatched).not.toContainEqual({ type: 'auth/clearAuth' });
  });

  it('does NOT dispatch auth/clearAuth on a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'ok' }),
        text: async () => JSON.stringify({ data: 'ok' }),
        headers: { get: () => 'application/json' },
        clone: function () { return this; },
      }),
    );

    const baseQuery = createAuthBaseQuery('http://localhost');
    const api = makeApi('valid-token');

    await baseQuery('/investments', api as never, {});

    expect(api.dispatched).not.toContainEqual({ type: 'auth/clearAuth' });
  });
});
