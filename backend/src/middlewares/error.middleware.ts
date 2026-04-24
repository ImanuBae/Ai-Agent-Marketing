// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { QuotaExhaustedError } from '../services/quota.manager';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof QuotaExhaustedError) {
    console.warn('🔴 QuotaExhaustedError intercepted by middleware:', err.message);
    return sendError(res, err.message, 503);
  }

  console.error('❌ Unhandled error:', err.message);
  console.error(err.stack);
  return sendError(res, err.message || 'Lỗi server', 500);
};
