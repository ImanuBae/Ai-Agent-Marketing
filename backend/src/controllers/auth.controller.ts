// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { JwtPayload } from '../types';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../utils/mailer';

// ── ĐĂNG KÝ ───────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Kiểm tra thiếu field
    if (!email || !password || !name) {
      return sendError(res, 'Vui lòng điền đầy đủ thông tin', 400);
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'Email đã được sử dụng', 409);
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo user mới
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return sendSuccess(res, 'Đăng ký thành công!', user, 201);
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── ĐĂNG NHẬP ─────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Vui lòng nhập email và mật khẩu', 400);
    }

    // Tìm user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 'Email hoặc mật khẩu không đúng', 401);
    }

    // Kiểm tra tài khoản bị khóa
    if (user.isLocked) {
      return sendError(res, 'Tài khoản đã bị khóa, vui lòng liên hệ Admin', 403);
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Email hoặc mật khẩu không đúng', 401);
    }

    // Tạo JWT token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);

    return sendSuccess(res, 'Đăng nhập thành công!', {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── LẤY THÔNG TIN USER ĐANG ĐĂNG NHẬP ────────────────────────
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, name: true,
        role: true, avatar: true, createdAt: true,
      },
    });

    if (!user) return sendError(res, 'Không tìm thấy user', 404);

    return sendSuccess(res, 'Lấy thông tin thành công', user);
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── QUÊN MẬT KHẨU ─────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Không tiết lộ email có tồn tại hay không — bảo mật
    if (!user) {
      return sendSuccess(
        res,
        'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu'
      );
    }

    // Tạo reset token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    // Lưu token vào DB
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // Gửi email
    await sendResetPasswordEmail(email, resetToken);

    return sendSuccess(
      res,
      'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu'
    );
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── ĐẶT LẠI MẬT KHẨU ─────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Tìm user có token hợp lệ và chưa hết hạn
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // gt = greater than (chưa hết hạn)
      },
    });

    if (!user) {
      return sendError(res, 'Token không hợp lệ hoặc đã hết hạn', 400);
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Cập nhật mật khẩu, xóa token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return sendSuccess(res, 'Đặt lại mật khẩu thành công, vui lòng đăng nhập lại');
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};

// ── ĐỔI MẬT KHẨU (đang đăng nhập) ────────────────────────────
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return sendError(res, 'Không tìm thấy user', 404);

    // Kiểm tra mật khẩu hiện tại
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return sendError(res, 'Mật khẩu hiện tại không đúng', 400);
    }

    // Mã hóa và cập nhật mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return sendSuccess(res, 'Đổi mật khẩu thành công');
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};