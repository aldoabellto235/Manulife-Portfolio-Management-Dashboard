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

export interface PaginationData<T> {
  datas: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiPagination<T> {
  data: PaginationData<T>;
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
  datas: T[],
  page: number,
  limit: number,
  total: number,
  code = 200,
): ApiPagination<T> => ({
  data: { datas, page, limit, total },
  status: 'ok',
  code,
});
