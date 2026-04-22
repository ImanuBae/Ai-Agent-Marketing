// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { getQuotaStatus, testGeminiAPI } from '../services/gemini.service';

// ── CẬP NHẬT THÔNG TIN CÁ NHÂN ────────────────────────────────
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user!.userId;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true, email: true, name: true,
        role: true, avatar: true, updatedAt: true,
      },
    });

    return sendSuccess(res, 'Cập nhật thông tin thành công', updated);
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── [ADMIN] XEM DANH SÁCH USER ────────────────────────────────
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Phân trang: ?page=1&limit=10
    const page  = parseInt(req.query.page as string)  || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip  = (page - 1) * limit;

    const search = req.query.search as string;
    const role = req.query.role as string;

    const where: any = search
      ? {
          OR: [
            { name:  { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    if (role === 'ADMIN' || role === 'USER') {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true, email: true, name: true,
          role: true, avatar: true,
          isLocked: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess(res, 'Lấy danh sách user thành công', {
      users,
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

// ── [ADMIN] XEM CHI TIẾT 1 USER ───────────────────────────────
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true,
        role: true, avatar: true,
        isLocked: true, createdAt: true,
        _count: {
          select: {
            contents:  true,
            schedules: true,
            socials:   true,
          },
        },
      },
    });

    if (!user) return sendError(res, 'Không tìm thấy user', 404);

    return sendSuccess(res, 'Lấy thông tin user thành công', user);
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── [ADMIN] KHÓA / MỞ KHÓA TÀI KHOẢN ────────────────────────
export const toggleLockUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Không cho khóa chính mình
    if (id === req.user!.userId) {
      return sendError(res, 'Không thể khóa tài khoản của chính mình', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'Không tìm thấy user', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { isLocked: !user.isLocked },
      select: { id: true, email: true, name: true, isLocked: true },
    });

    const message = updated.isLocked
      ? 'Đã khóa tài khoản thành công'
      : 'Đã mở khóa tài khoản thành công';

    return sendSuccess(res, message, updated);
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── [ADMIN] XÓA USER ──────────────────────────────────────────
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (id === req.user!.userId) {
      return sendError(res, 'Không thể xóa tài khoản của chính mình', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'Không tìm thấy user', 404);

    await prisma.user.delete({ where: { id } });

    return sendSuccess(res, 'Xóa tài khoản thành công');
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── [ADMIN] CẤP / THU HỒI QUYỀN ADMIN ───────────────────────
export const toggleAdminRole = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (id === req.user!.userId) {
      return sendError(res, 'Không thể thay đổi quyền của chính mình', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'Không tìm thấy user', 404);

    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';

    const updated = await prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: { id: true, email: true, name: true, role: true },
    });

    const message = newRole === 'ADMIN'
      ? 'Đã cấp quyền Admin thành công'
      : 'Đã thu hồi quyền Admin thành công';

    return sendSuccess(res, message, updated);
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── KIỂM TRA QUOTA API GEMINI ──────────────────────────────────
export const getApiQuotaStatus = async (req: Request, res: Response) => {
  try {
    const quota = getQuotaStatus();
    
    return sendSuccess(res, 'Lấy thông tin quota thành công', {
      quota,
      message: quota.remaining === 0 
        ? '⚠️ Hết quota cho hôm nay. Quay lại vào ngày mai!'
        : `Còn ${quota.remaining}/${quota.limit} requests`,
    });
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── TEST GEMINI API ────────────────────────────────────────────
export const testGeminiConnection = async (req: Request, res: Response) => {
  try {
    const result = await testGeminiAPI();
    
    if (result.success) {
      return sendSuccess(res, '✅ Gemini API hoạt động bình thường', result);
    } else {
      return sendError(res, '❌ Lỗi kết nối Gemini API', 500, result.error);
    }
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};