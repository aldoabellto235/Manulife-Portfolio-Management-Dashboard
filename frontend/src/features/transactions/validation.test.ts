import { describe, it, expect } from 'vitest';
import Joi from 'joi';
import type { TransactionFormData } from './types';

// Mirror of the schema defined in TransactionForm.tsx
const schema = Joi.object<TransactionFormData>({
  assetId: Joi.string().uuid().required().messages({
    'string.empty': 'Select an asset',
    'string.guid': 'Select a valid asset',
  }),
  type: Joi.string().valid('BUY', 'SELL').required().messages({
    'any.only': 'Select BUY or SELL',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Enter a valid quantity',
    'number.integer': 'Must be a whole number',
    'number.min': 'Must be at least 1',
  }),
  price: Joi.number().positive().required().messages({
    'number.base': 'Enter a valid price',
    'number.positive': 'Must be greater than 0',
  }),
  currency: Joi.string().default('IDR'),
  date: Joi.string().required().messages({
    'string.empty': 'Select a date',
  }),
});

const VALID: TransactionFormData = {
  assetId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  type: 'BUY',
  quantity: 10,
  price: 150000,
  currency: 'IDR',
  date: '2024-01-15',
};

function validate(data: Partial<TransactionFormData>) {
  return schema.validate({ ...VALID, ...data }, { abortEarly: false });
}

describe('TransactionForm schema — valid data', () => {
  it('passes with all valid fields', () => {
    const { error } = schema.validate(VALID);
    expect(error).toBeUndefined();
  });

  it('accepts SELL type', () => {
    const { error } = validate({ type: 'SELL' });
    expect(error).toBeUndefined();
  });

  it('applies IDR as default currency', () => {
    const data = { ...VALID };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (data as any).currency;
    const { value } = schema.validate(data);
    expect(value.currency).toBe('IDR');
  });
});

describe('TransactionForm schema — assetId', () => {
  it('fails when assetId is empty', () => {
    const { error } = validate({ assetId: '' });
    expect(error?.details[0].message).toBe('Select an asset');
  });

  it('fails when assetId is not a UUID', () => {
    const { error } = validate({ assetId: 'not-a-uuid' });
    expect(error?.details[0].message).toBe('Select a valid asset');
  });
});

describe('TransactionForm schema — type', () => {
  it('fails when type is invalid', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = validate({ type: 'HOLD' as any });
    expect(error?.details[0].message).toBe('Select BUY or SELL');
  });
});

describe('TransactionForm schema — quantity', () => {
  it('fails when quantity is 0', () => {
    const { error } = validate({ quantity: 0 });
    expect(error?.details[0].message).toBe('Must be at least 1');
  });

  it('fails when quantity is negative', () => {
    const { error } = validate({ quantity: -5 });
    expect(error?.details[0].message).toBe('Must be at least 1');
  });

  it('fails when quantity is a decimal', () => {
    const { error } = validate({ quantity: 1.5 });
    expect(error?.details[0].message).toBe('Must be a whole number');
  });
});

describe('TransactionForm schema — price', () => {
  it('fails when price is 0', () => {
    const { error } = validate({ price: 0 });
    expect(error?.details[0].message).toBe('Must be greater than 0');
  });

  it('fails when price is negative', () => {
    const { error } = validate({ price: -100 });
    expect(error?.details[0].message).toBe('Must be greater than 0');
  });
});

describe('TransactionForm schema — date', () => {
  it('fails when date is empty', () => {
    const { error } = validate({ date: '' });
    expect(error?.details[0].message).toBe('Select a date');
  });
});
