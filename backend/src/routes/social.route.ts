import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getAuthUrl,
  connectFacebook,
  connectThreads,
  handleCallback,
  getAccounts,
  disconnect,
} from '../controllers/social.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Social
 *   description: OAuth 2.0 kết nối tài khoản mạng xã hội
 */

/**
 * @swagger
 * /api/social/connect/facebook:
 *   get:
 *     summary: Khởi tạo OAuth flow với Facebook
 *     description: Redirect trình duyệt đến trang xác thực của Facebook. Yêu cầu JWT trong header.
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       302:
 *         description: Redirect đến Facebook OAuth
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
/**
 * @swagger
 * /api/social/auth-url/{platform}:
 *   get:
 *     summary: Lấy OAuth URL dạng JSON (frontend dùng để redirect)
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [facebook, threads]
 *     responses:
 *       200:
 *         description: OAuth URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 */
router.get('/auth-url/:platform', authenticate, getAuthUrl);

router.get('/connect/facebook', authenticate, connectFacebook);

/**
 * @swagger
 * /api/social/connect/threads:
 *   get:
 *     summary: Khởi tạo OAuth flow với Threads
 *     description: Redirect trình duyệt đến trang xác thực của Threads. Yêu cầu JWT trong header.
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       302:
 *         description: Redirect đến Threads OAuth
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
router.get('/connect/threads', authenticate, connectThreads);

/**
 * @swagger
 * /api/social/callback/{platform}:
 *   get:
 *     summary: OAuth callback từ platform
 *     description: |
 *       Endpoint này được platform (Facebook/Threads) gọi sau khi user cấp quyền.
 *       Validate state chống CSRF, đổi code lấy access_token, lưu DB, rồi redirect về frontend.
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [facebook, threads]
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code từ platform
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State token CSRF
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: Lỗi từ platform (user từ chối cấp quyền)
 *     responses:
 *       302:
 *         description: Redirect về frontend với kết quả kết nối
 */
router.get('/callback/:platform', handleCallback);

/**
 * @swagger
 * /api/social/accounts:
 *   get:
 *     summary: Lấy danh sách tài khoản mạng xã hội đã kết nối
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách kết nối
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       platform:
 *                         type: string
 *                         enum: [facebook, threads]
 *                       accountName:
 *                         type: string
 *                       accountId:
 *                         type: string
 *                       avatarUrl:
 *                         type: string
 *                         nullable: true
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/accounts', authenticate, getAccounts);

/**
 * @swagger
 * /api/social/{platform}:
 *   delete:
 *     summary: Ngắt kết nối một tài khoản mạng xã hội
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [facebook, threads]
 *     responses:
 *       200:
 *         description: Ngắt kết nối thành công
 *       404:
 *         description: Kết nối không tồn tại
 *       401:
 *         description: Chưa đăng nhập
 */
router.delete('/:platform', authenticate, disconnect);

export default router;
