// src/controllers/chat.controller.ts
import { Request, Response } from 'express';
import { chatWithAI } from '../services/gemini.service';
import { sendSuccess, sendError } from '../utils/response';
import { QuotaExhaustedError } from '../services/quota.manager';

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return sendError(res, 'Tin nhắn không được để trống', 400);
    }

    const text = await chatWithAI(message, history);
    return sendSuccess(res, 'Thành công', { text });
  } catch (error) {
    if (error instanceof QuotaExhaustedError) {
      return sendError(res, error.message, 503);
    }
    console.error('Chat AI Error:', error);
    return sendError(res, 'Lỗi khi trò chuyện với AI', 500, error);
  }
};
