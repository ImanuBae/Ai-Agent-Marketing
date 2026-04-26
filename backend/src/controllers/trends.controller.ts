// src/controllers/trends.controller.ts
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { fetchDailyTrends, compareKeywords, fetchYouTubeTrends, suggestTopics } from '../services/trends.service';

// ── GET /api/trends/keywords ──────────────────────────────────────────────────

export const getKeywords = async (req: Request, res: Response) => {
  try {
    const geo = (req.query.geo as string) ?? 'VN';
    const trends = await fetchDailyTrends(geo);
    return sendSuccess(res, 'Lấy từ khóa thành công', { trends });
  } catch (error) {
    return sendError(res, 'Không thể lấy dữ liệu xu hướng Google Trends', 503, error);
  }
};

// ── GET /api/trends/compare?keywords=a,b,c ───────────────────────────────────

export const getCompare = async (req: Request, res: Response) => {
  try {
    const { keywords, geo } = req.query;
    if (!keywords) return sendError(res, 'Thiếu tham số keywords', 400);

    const kwArray = (keywords as string).split(',').map(k => k.trim()).filter(Boolean);
    if (kwArray.length < 2 || kwArray.length > 5) {
      return sendError(res, 'Cần 2–5 từ khóa để so sánh', 400);
    }

    const data = await compareKeywords(kwArray, (geo as string) ?? 'VN');
    return sendSuccess(res, 'So sánh từ khóa thành công', { data });
  } catch (error) {
    return sendError(res, 'Không thể so sánh từ khóa', 503, error);
  }
};

// ── GET /api/trends/youtube ───────────────────────────────────────────────────

export const getYouTubeTrends = async (req: Request, res: Response) => {
  try {
    const geo = (req.query.geo as string) ?? 'VN';
    const videos = await fetchYouTubeTrends(geo);
    return sendSuccess(res, 'Lấy video trending thành công', { videos });
  } catch (error: any) {
    if (error?.code === 'NO_API_KEY') {
      return sendError(res, error.message, 503);
    }
    return sendError(res, 'Không thể lấy video trending', 500, error);
  }
};

// ── GET /api/trends/suggest?keywords=a,b,c ───────────────────────────────────

export const getSuggest = async (req: Request, res: Response) => {
  try {
    const { keywords } = req.query;
    if (!keywords) return sendError(res, 'Thiếu tham số keywords', 400);

    const kwArray = (keywords as string).split(',').map(k => k.trim()).filter(Boolean);
    if (kwArray.length === 0) return sendError(res, 'keywords không hợp lệ', 400);

    const ideas = await suggestTopics(kwArray);
    return sendSuccess(res, 'Gợi ý chủ đề thành công', { ideas });
  } catch (error) {
    return sendError(res, 'Không thể gợi ý chủ đề', 500, error);
  }
};
