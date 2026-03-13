export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  data: { accessToken: string };
  status: 'ok';
  code: number;
}

export interface MeResponse {
  data: User;
  status: 'ok';
  code: number;
}

export interface LogoutResponse {
  data: { message: string };
  status: 'ok';
  code: number;
}

export interface ApiError {
  status: 'error';
  code: number;
  error: { message: string };
}
