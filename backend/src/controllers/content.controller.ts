// src/controllers/content.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import {
  generateCaption,
  generateHashtags,
  generateProductDescription,
  generateContentStrategy,
} from '../services/gemini.service';

type Platform = 'facebook' | 'linkedin' | 'tiktok';

// ── TẠO CAPTION BẰNG AI ───────────────────────────────────────
export const createCaption = async (req: Request, res: Response) => {
  try {
    const { brief, platform, tone } = req.body;
    const userId = req.user!.userId;

    const caption = await generateCaption(brief, platform as Platform, tone);
    const hashtags = await generateHashtags(caption, platform as Platform);

    // Lưu vào DB
    const content = await prisma.content.create({
      data: {
        userId,
        platform,
        caption,
        hashtags,
        status: 'draft',
      },
    });

    return sendSuccess(res, 'Tạo caption thành công', { content, hashtags });
  } catch (error) {
    return sendError(res, 'Lỗi khi gọi AI', 500, error);
  }
};

// ── GỢI Ý HASHTAG ─────────────────────────────────────────────
export const suggestHashtags = async (req: Request, res: Response) => {
  try {
    const { content, platform } = req.body;

    const hashtags = await generateHashtags(content, platform as Platform);

    return sendSuccess(res, 'Gợi ý hashtag thành công', { hashtags });
  } catch (error) {
    return sendError(res, 'Lỗi khi gọi AI', 500, error);
  }
};

// ── TẠO MÔ TẢ SẢN PHẨM ───────────────────────────────────────
export const createProductDescription = async (req: Request, res: Response) => {
  try {
    const { productName, features, targetAudience } = req.body;

    const description = await generateProductDescription(
      productName, features, targetAudience
    );

    return sendSuccess(res, 'Tạo mô tả sản phẩm thành công', { description });
  } catch (error) {
    return sendError(res, 'Lỗi khi gọi AI', 500, error);
  }
};

// ── XEM LỊCH SỬ CONTENT ───────────────────────────────────────
export const getContentHistory = async (req: Request, res: Response) => {
  try {
    const userId   = req.user!.userId;
    const page     = parseInt(req.query.page  as string) || 1;
    const limit    = parseInt(req.query.limit as string) || 10;
    const platform = req.query.platform as string;
    const status   = req.query.status   as string;
    const skip     = (page - 1) * limit;

    const where = {
      userId,
      ...(platform && { platform }),
      ...(status   && { status }),
    };

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { schedule: true },
      }),
      prisma.content.count({ where }),
    ]);

    return sendSuccess(res, 'Lấy lịch sử content thành công', {
      contents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── CẬP NHẬT CONTENT ──────────────────────────────────────────
export const updateContent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { caption, hashtags } = req.body;
    const userId              = req.user!.userId;

    const content = await prisma.content.findFirst({ where: { id, userId } });
    if (!content) return sendError(res, 'Không tìm thấy content', 404);
    if (content.status === 'published') {
      return sendError(res, 'Không thể chỉnh sửa bài đã đăng', 400);
    }

    const updated = await prisma.content.update({
      where: { id },
      data: {
        ...(caption  && { caption }),
        ...(hashtags && { hashtags }),
      },
    });

    return sendSuccess(res, 'Cập nhật content thành công', updated);
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── XÓA CONTENT ───────────────────────────────────────────────
export const deleteContent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const content = await prisma.content.findFirst({ where: { id, userId } });
    if (!content) return sendError(res, 'Không tìm thấy content', 404);
    if (content.status === 'published') {
      return sendError(res, 'Không thể xóa bài đã đăng', 400);
    }

    await prisma.content.delete({ where: { id } });

    return sendSuccess(res, 'Xóa content thành công');
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── LƯU TEMPLATE ──────────────────────────────────────────────
export const saveTemplate = async (req: Request, res: Response) => {
  try {
    const { name, brief, platform, tone } = req.body;
    const userId = req.user!.userId;

    const template = await prisma.contentTemplate.create({
      data: { userId, name, brief, platform, tone },
    });

    return sendSuccess(res, 'Lưu template thành công', template, 201);
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── XEM DANH SÁCH TEMPLATE ────────────────────────────────────
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const templates = await prisma.contentTemplate.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Lấy danh sách template thành công', templates);
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── ĐỀ XUẤT CHIẾN LƯỢC ───────────────────────────────────────
export const getContentStrategy = async (req: Request, res: Response) => {
  try {
    const { industry, platform } = req.body;
    const userId = req.user!.userId;

    // Lấy 5 bài có nhiều lượt tương tác nhất
    const topContents = await prisma.content.findMany({
      where:   { userId, platform, status: 'published' },
      take:    5,
      orderBy: { createdAt: 'desc' },
      select:  { caption: true, hashtags: true },
    });

    const topPostsSummary = topContents
      .map((c, i) => `Bài ${i + 1}: ${c.caption.slice(0, 100)}...`)
      .join('\n');

    const strategy = await generateContentStrategy(
      industry,
      topPostsSummary || 'Chưa có dữ liệu bài đăng',
      platform
    );

    return sendSuccess(res, 'Tạo chiến lược thành công', { strategy });
  } catch (error) {
    return sendError(res, 'Lỗi khi gọi AI', 500, error);
  }
};