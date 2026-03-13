import Joi from 'joi';

export const AddTransactionSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
  type: Joi.string().valid('BUY', 'SELL').required(),
  quantity: Joi.number().integer().positive().required(),
  price: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().default('IDR'),
  date: Joi.string().isoDate().optional(),
});
