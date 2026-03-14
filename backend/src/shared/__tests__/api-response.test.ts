import { successResponse, errorResponse, paginationResponse } from '../api-response';

describe('api-response helpers', () => {
  describe('successResponse', () => {
    it('returns status ok with code 200 by default', () => {
      const res = successResponse({ id: 1 });
      expect(res.status).toBe('ok');
      expect(res.code).toBe(200);
      expect(res.data).toEqual({ id: 1 });
    });

    it('accepts a custom code', () => {
      const res = successResponse({ id: 1 }, 201);
      expect(res.code).toBe(201);
    });

    it('works with array data', () => {
      const res = successResponse([1, 2, 3]);
      expect(res.data).toEqual([1, 2, 3]);
    });

    it('works with null data', () => {
      const res = successResponse(null);
      expect(res.data).toBeNull();
    });
  });

  describe('errorResponse', () => {
    it('returns status error with the given message and code', () => {
      const res = errorResponse('Not found', 404);
      expect(res.status).toBe('error');
      expect(res.code).toBe(404);
      expect(res.error.message).toBe('Not found');
    });

    it('data is an empty object', () => {
      const res = errorResponse('Bad request', 400);
      expect(res.data).toEqual({});
    });
  });

  describe('paginationResponse', () => {
    const items = ['a', 'b', 'c'];

    it('returns status ok with code 200 by default', () => {
      const res = paginationResponse(items, 1, 10, 30);
      expect(res.status).toBe('ok');
      expect(res.code).toBe(200);
    });

    it('includes correct pagination metadata', () => {
      const res = paginationResponse(items, 2, 5, 50);
      expect(res.pagination).toEqual({ page: 2, limit: 5, total: 50 });
    });

    it('includes the data array', () => {
      const res = paginationResponse(items, 1, 10, 3);
      expect(res.data).toEqual(items);
    });

    it('accepts a custom status code', () => {
      const res = paginationResponse(items, 1, 10, 3, 201);
      expect(res.code).toBe(201);
    });

    it('works with empty data', () => {
      const res = paginationResponse([], 1, 10, 0);
      expect(res.data).toHaveLength(0);
      expect(res.pagination.total).toBe(0);
    });
  });
});
