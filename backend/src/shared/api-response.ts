export interface ApiSuccess<T> {
  data: T;
  status: 'ok';
  code: number;
}

export interface ApiError {
  data: Record<string, never>;
  status: 'error';
  code: number;
  error: {
    message: string;
  };
}

export interface ApiPagination<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  data: T[];
  status: 'ok';
  code: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError | ApiPagination<T>;

export const successResponse = <T>(data: T, code = 200): ApiSuccess<T> => ({
  data,
  status: 'ok',
  code,
});

export const errorResponse = (message: string, code: number): ApiError => ({
  data: {},
  status: 'error',
  code,
  error: { message },
});

export const paginationResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  code = 200,
): ApiPagination<T> => ({
  pagination: { page, limit, total },
  data,
  status: 'ok',
  code,
});
