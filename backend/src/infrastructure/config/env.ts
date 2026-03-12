import 'dotenv/config';
import Joi from 'joi';

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().integer().positive().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters',
  }),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  BASIC_AUTH_USER: Joi.string().required(),
  BASIC_AUTH_PASSWORD: Joi.string().required(),
}).unknown(true);

const { error, value } = schema.validate(process.env, { abortEarly: false });

if (error) {
  console.error('[Config] Missing or invalid environment variables:');
  error.details.forEach((d) => console.error(' -', d.message));
  process.exit(1);
}

export const env = value as {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BASIC_AUTH_USER: string;
  BASIC_AUTH_PASSWORD: string;
};
