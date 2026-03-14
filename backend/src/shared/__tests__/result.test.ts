import { ok, err, Result } from '../result';

describe('Result', () => {
  describe('ok', () => {
    it('isOk returns true', () => {
      expect(ok('value').isOk()).toBe(true);
    });

    it('isErr returns false', () => {
      expect(ok('value').isErr()).toBe(false);
    });

    it('unwrap returns the value', () => {
      expect(ok(42).unwrap()).toBe(42);
    });

    it('unwrap works with objects', () => {
      const val = { x: 1 };
      expect(ok(val).unwrap()).toBe(val);
    });

    it('_tag is Ok', () => {
      expect(ok('x')._tag).toBe('Ok');
    });

    it('value property is accessible', () => {
      const result = ok('hello');
      if (result.isOk()) {
        expect(result.value).toBe('hello');
      }
    });
  });

  describe('err', () => {
    it('isOk returns false', () => {
      expect(err('SOME_ERROR').isOk()).toBe(false);
    });

    it('isErr returns true', () => {
      expect(err('SOME_ERROR').isErr()).toBe(true);
    });

    it('_tag is Err', () => {
      expect(err('x')._tag).toBe('Err');
    });

    it('error property is accessible', () => {
      const result = err('MY_ERROR');
      if (result.isErr()) {
        expect(result.error).toBe('MY_ERROR');
      }
    });

    it('unwrap throws with the error serialized', () => {
      const result: Result<string, string> = err('FAIL');
      expect(() => result.unwrap()).toThrow('FAIL');
    });

    it('unwrap throws for object errors', () => {
      const result: Result<string, object> = err({ type: 'NOT_FOUND' });
      expect(() => result.unwrap()).toThrow();
    });
  });

  describe('type narrowing', () => {
    it('narrows to Ok after isOk check', () => {
      const result: Result<number, string> = ok(5);
      if (result.isOk()) {
        expect(result.value).toBe(5);
      } else {
        fail('Should have been Ok');
      }
    });

    it('narrows to Err after isErr check', () => {
      const result: Result<number, string> = err('oops');
      if (result.isErr()) {
        expect(result.error).toBe('oops');
      } else {
        fail('Should have been Err');
      }
    });
  });
});
