import crypto from 'crypto';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { getFrontendRedirectUrl } from '../utils/oauth';
import * as socialService from '../services/social.service';
import prisma from '../utils/prisma';

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

// Meta Data Deletion Callback
// Meta POSTs a signed_request when a user revokes app access and requests data deletion.
// Docs: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
function parseSignedRequest(signedRequest: string, secret: string) {
  const [encodedSig, payload] = signedRequest.split('.');
  if (!encodedSig || !payload) throw new Error('Invalid format');

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(encodedSig), Buffer.from(expectedSig))) {
    throw new Error('Bad signature');
  }

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

export const handleDataDeletion = async (req: Request, res: Response) => {
  const signedRequest = req.body?.signed_request as string | undefined;
  if (!signedRequest) {
    return res.status(400).json({ error: 'missing signed_request' });
  }

  const secret =
    process.env.THREADS_CLIENT_SECRET ||
    process.env.FACEBOOK_CLIENT_SECRET ||
    '';

  let payload: any;
  try {
    payload = parseSignedRequest(signedRequest, secret);
  } catch {
    return res.status(400).json({ error: 'invalid signed_request' });
  }

  const metaUserId: string = payload.user_id;
  const confirmationCode = `del_${metaUserId}_${Date.now()}`;

  // Best-effort: delete all social tokens associated with this Meta user ID
  await prisma.socialAccount.deleteMany({ where: { accountId: metaUserId } });

  const statusUrl = `${process.env.BACKEND_URL}/api/social/data-deletion/${confirmationCode}`;
  return res.json({ url: statusUrl, confirmation_code: confirmationCode });
};

export const dataDeletionStatus = (_req: Request, res: Response) => {
  return res.json({ status: 'deleted', message: 'User data has been deleted per your request.' });
};
