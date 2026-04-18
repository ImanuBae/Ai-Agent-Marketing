import { Request, Response } from 'express';
import { chatWithAI } from '../services/gemini.service';
import { sendSuccess, sendError } from '../utils/response';

<<<<<<< HEAD
=======
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

>>>>>>> ecfbb4836e00948c26b03a5f1f7045bf30285fc6
export const handleChat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return sendError(res, 'Tin nhắn không được để trống', 400);
    }

    const text = await chatWithAI(message, history);

    return sendSuccess(res, 'Thành công', { text });
  } catch (error) {
    console.error('Chat AI Error:', error);
    return sendError(res, 'Lỗi khi trò chuyện với AI', 500, error);
  }
};
