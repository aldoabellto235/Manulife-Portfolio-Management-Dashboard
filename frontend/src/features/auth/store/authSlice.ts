import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';
import { authApi } from '../api/authApi';

interface AuthState {
  token: string | null;
  user: User | null;
}

const TOKEN_KEY = 'auth_token';

const initialState: AuthState = {
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem(TOKEN_KEY, action.payload);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
  extraReducers: (builder) => {
    // Persist token after login
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      state.token = action.payload.data.accessToken;
      localStorage.setItem(TOKEN_KEY, action.payload.data.accessToken);
    });
    // Persist token after register
    builder.addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
      state.token = action.payload.data.accessToken;
      localStorage.setItem(TOKEN_KEY, action.payload.data.accessToken);
    });
    // Store user from /auth/me
    builder.addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
      state.user = action.payload.data;
    });
    // Clear on logout
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
    });
  },
});

export const { setToken, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
