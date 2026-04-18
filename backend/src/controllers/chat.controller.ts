import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendSuccess, sendError } from '../utils/response';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return sendError(res, 'Tin nhắn không được để trống', 400);
    }

    const prompt = `
Bạn là MarketAI - Chuyên gia Marketing AI người Việt Nam. 
Nhiệm vụ của bạn là hỗ trợ người dùng về các chiến lược marketing, quảng cáo, viết bài và phân tích dữ liệu.

Lịch sử trò chuyện:
${history?.map((h: any) => `${h.sender === 'user' ? 'Người dùng' : 'MarketAI'}: ${h.text}`).join('\n')}

Người dùng: ${message}

Hãy trả lời một cách chuyên nghiệp, sáng tạo và hữu ích. Nếu người dùng yêu cầu tạo content, hãy đưa ra gợi ý caption hoặc hashtag phù hợp.
`.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return sendSuccess(res, 'Thành công', { text });
  } catch (error) {
    console.error('Chat AI Error:', error);
    return sendError(res, 'Lỗi khi trò chuyện với AI', 500, error);
  }
};
