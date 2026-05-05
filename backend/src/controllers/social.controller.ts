import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { getFrontendRedirectUrl } from '../utils/oauth';
import * as socialService from '../services/social.service';

// Returns the OAuth URL as JSON so the frontend can redirect via JS (JWT can't be
// sent in a plain browser redirect, so we separate "get URL" from "navigate").
export const getAuthUrl = async (req: Request, res: Response) => {
  const platform = req.params.platform as string;
  try {
    let url: string;
    if (platform === 'facebook') {
      url = await socialService.getFacebookAuthUrl(req.user!.userId);
    } else if (platform === 'threads') {
      url = await socialService.getThreadsAuthUrl(req.user!.userId);
    } else {
      return sendError(res, `Platform không được hỗ trợ: ${platform}`, 400);
    }
    return sendSuccess(res, 'Auth URL', { url });
  } catch (error) {
    return sendError(res, 'Không thể tạo URL xác thực', 500, error);
  }
};

export const connectFacebook = async (req: Request, res: Response) => {
  try {
    const url = await socialService.getFacebookAuthUrl(req.user!.userId);
    return res.redirect(url);
  } catch (error) {
    return sendError(res, 'Không thể tạo URL xác thực Facebook', 500, error);
  }
};

export const connectThreads = async (req: Request, res: Response) => {
  try {
    const url = await socialService.getThreadsAuthUrl(req.user!.userId);
    return res.redirect(url);
  } catch (error) {
    return sendError(res, 'Không thể tạo URL xác thực Threads', 500, error);
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  const platform = req.params.platform as string;
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  const oauthError = req.query.error as string | undefined;

  if (oauthError || !code || !state) {
    return res.redirect(
      getFrontendRedirectUrl(platform, false, oauthError ?? 'Thiếu code hoặc state'),
    );
  }

  try {
    await socialService.handleCallback(platform, code, state);
    return res.redirect(getFrontendRedirectUrl(platform, true));
  } catch (error: any) {
    return res.redirect(getFrontendRedirectUrl(platform, false, error?.message));
  }
};

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await socialService.getSocialAccounts(req.user!.userId);
    return sendSuccess(res, 'Danh sách tài khoản đã kết nối', accounts);
  } catch (error) {
    return sendError(res, 'Không thể tải danh sách kết nối', 500, error);
  }
};

export const disconnect = async (req: Request, res: Response) => {
  const platform = req.params.platform as string;
  try {
    await socialService.disconnectSocial(req.user!.userId, platform);
    return sendSuccess(res, `Đã ngắt kết nối ${platform}`);
  } catch (error: any) {
    const status = error?.message === 'Kết nối không tồn tại' ? 404 : 500;
    return sendError(res, error?.message ?? 'Lỗi server', status, error);
  }
};
