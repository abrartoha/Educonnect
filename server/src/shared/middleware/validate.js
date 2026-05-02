import { ZodError } from 'zod';
import { BadRequestError } from '../utils/errors.js';

// Usage: router.post('/x', validate({ body: schema }), handler)
export const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(
        new BadRequestError('Validation failed', {
          issues: err.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        })
      );
    }
    next(err);
  }
};
