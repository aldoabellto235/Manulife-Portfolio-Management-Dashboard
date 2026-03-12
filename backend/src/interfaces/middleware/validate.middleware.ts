import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { errorResponse } from '../../shared/api-response';

export const validate =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      res.status(400).json(errorResponse(message, 400));
      return;
    }

    req.body = value;
    next();
  };
