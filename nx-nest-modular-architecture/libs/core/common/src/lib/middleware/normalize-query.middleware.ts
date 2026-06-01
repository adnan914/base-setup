import { NextFunction, Request, Response } from 'express';

export function createNormalizeQueryMiddleware() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.query && typeof req.query === 'object') {
      for (const [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value)) {
          req.query[key] = value[value.length - 1];
        }
      }
    }

    next();
  };
}
