// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

// Kiểm tra các field bắt buộc có trong body không
export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return sendError(
        res,
        `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`,
        400
      );
    }

    return next();
  };
};

// Kiểm tra email đúng format
export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email && !emailRegex.test(email)) {
    return sendError(res, 'Email không đúng định dạng', 400);
  }

  return next();
};

// Kiểm tra password đủ mạnh
export const validatePassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password } = req.body;

  if (password && password.length < 6) {
    return sendError(res, 'Mật khẩu phải có ít nhất 6 ký tự', 400);
  }

  return next();
};
