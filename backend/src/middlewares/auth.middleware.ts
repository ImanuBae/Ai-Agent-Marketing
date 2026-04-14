// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';
import { sendError } from '../utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy token từ header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Chưa đăng nhập', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Gắn thông tin user vào request để dùng ở controller
    req.user = decoded;
    return next();
  } catch {
    return sendError(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
  }
};

// Middleware kiểm tra quyền Admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return sendError(res, 'Bạn không có quyền thực hiện thao tác này', 403);
  }
  return next();
};