// src/types/index.ts

export type UserRole = 'USER' | 'ADMIN';

// Cấu trúc payload lưu trong JWT token
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Gắn thêm user vào Request object của Express
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Cấu trúc response chuẩn trả về cho client
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}