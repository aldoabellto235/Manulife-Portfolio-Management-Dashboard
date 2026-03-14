import { describe, it, expect } from 'vitest';
import Joi from 'joi';
import type { InvestmentFormData } from './types';

// Mirror of the schema defined in InvestmentForm.tsx
const schema = Joi.object<InvestmentFormData>({
  type: Joi.string().valid('STOCK', 'BOND', 'MUTUAL_FUND').required().messages({
    'any.only': 'Select an asset type',
    'string.empty': 'Type is required',
  }),
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Name is required',
  }),
  symbol: Joi.string().min(1).max(20).required().messages({
    'string.empty': 'Symbol is required',
  }),
  purchasePrice: Joi.number().positive().required().messages({
    'number.base': 'Enter a valid price',
    'number.positive': 'Must be greater than 0',
  }),
  currentValue: Joi.number().positive().required().messages({
    'number.base': 'Enter a valid value',
    'number.positive': 'Must be greater than 0',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Enter a valid quantity',
    'number.integer': 'Must be a whole number',
    'number.min': 'Must be at least 1',
  }),
  currency: Joi.string().default('IDR'),
});

const VALID: InvestmentFormData = {
  type: 'STOCK',
  name: 'Bank Central Asia',
  symbol: 'BBCA',
  purchasePrice: 9500,
  currentValue: 10200,
  quantity: 100,
  currency: 'IDR',
};

function validate(data: Partial<InvestmentFormData>) {
  return schema.validate({ ...VALID, ...data }, { abortEarly: false });
}

describe('InvestmentForm schema — valid data', () => {
  it('passes with all valid fields', () => {
    const { error } = schema.validate(VALID);
    expect(error).toBeUndefined();
  });

  it('accepts BOND type', () => {
    const { error } = validate({ type: 'BOND' });
    expect(error).toBeUndefined();
  });

  it('accepts MUTUAL_FUND type', () => {
    const { error } = validate({ type: 'MUTUAL_FUND' });
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

describe('InvestmentForm schema — type', () => {
  it('fails for invalid type', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = validate({ type: 'CRYPTO' as any });
    expect(error?.details[0].message).toBe('Select an asset type');
  });
});

describe('InvestmentForm schema — name', () => {
  it('fails when name is empty', () => {
    const { error } = validate({ name: '' });
    expect(error?.details[0].message).toBe('Name is required');
  });

  it('fails when name exceeds 100 characters', () => {
    const { error } = validate({ name: 'A'.repeat(101) });
    expect(error).toBeDefined();
  });
});

describe('InvestmentForm schema — symbol', () => {
  it('fails when symbol is empty', () => {
    const { error } = validate({ symbol: '' });
    expect(error?.details[0].message).toBe('Symbol is required');
  });

  it('fails when symbol exceeds 20 characters', () => {
    const { error } = validate({ symbol: 'A'.repeat(21) });
    expect(error).toBeDefined();
  });
});

describe('InvestmentForm schema — purchasePrice', () => {
  it('fails when purchasePrice is 0', () => {
    const { error } = validate({ purchasePrice: 0 });
    expect(error?.details[0].message).toBe('Must be greater than 0');
  });

  it('fails when purchasePrice is negative', () => {
    const { error } = validate({ purchasePrice: -1000 });
    expect(error?.details[0].message).toBe('Must be greater than 0');
  });
});

describe('InvestmentForm schema — currentValue', () => {
  it('fails when currentValue is 0', () => {
    const { error } = validate({ currentValue: 0 });
    expect(error?.details[0].message).toBe('Must be greater than 0');
  });

  it('allows currentValue lower than purchasePrice (loss scenario)', () => {
    const { error } = validate({ purchasePrice: 10000, currentValue: 8000 });
    expect(error).toBeUndefined();
  });
});

describe('InvestmentForm schema — quantity', () => {
  it('fails when quantity is 0', () => {
    const { error } = validate({ quantity: 0 });
    expect(error?.details[0].message).toBe('Must be at least 1');
  });

  it('fails when quantity is a decimal', () => {
    const { error } = validate({ quantity: 2.5 });
    expect(error?.details[0].message).toBe('Must be a whole number');
  });

  it('passes with quantity of 1', () => {
    const { error } = validate({ quantity: 1 });
    expect(error).toBeUndefined();
  });
});
