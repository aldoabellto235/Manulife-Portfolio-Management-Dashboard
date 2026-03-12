import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

export const validate =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        issues: error.details.map((d) => d.message),
      });
      return;
    }

    req.body = value;
    next();
  };
