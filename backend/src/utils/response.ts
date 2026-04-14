// src/utils/response.ts
import { Response } from 'express';
import { ApiResponse } from '../types';

// Trả về 200 OK
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

// Trả về lỗi
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: unknown
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(response);
};