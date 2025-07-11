// middlewares/globalErrorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { MessageUtil } from '../utils';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || MessageUtil.SOMETHING_WENT_WRONG,
  });
};