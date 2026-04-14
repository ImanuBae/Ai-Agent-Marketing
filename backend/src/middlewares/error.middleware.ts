// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  return sendError(res, err.message || 'Lỗi server', 500);
};