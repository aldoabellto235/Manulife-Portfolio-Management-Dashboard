import Joi from 'joi';

export const AddInvestmentSchema = Joi.object({
  type: Joi.string().valid('STOCK', 'BOND', 'MUTUAL_FUND').required(),
  name: Joi.string().min(1).max(100).required(),
  symbol: Joi.string().min(1).max(20).uppercase().required(),
  purchasePrice: Joi.number().positive().required(),
  currentValue: Joi.number().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  currency: Joi.string().length(3).uppercase().default('IDR'),
});

export const EditInvestmentSchema = Joi.object({
  currentValue: Joi.number().positive(),
  quantity: Joi.number().integer().positive(),
}).or('currentValue', 'quantity');
