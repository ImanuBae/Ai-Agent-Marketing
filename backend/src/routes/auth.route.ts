// src/routes/auth.route.ts
import { Router } from 'express';
import {
  register, login, getMe,
  forgotPassword, resetPassword, changePassword
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody, validateEmail, validatePassword } from '../middlewares/validate.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       409:
 *         description: Email đã tồn tại
 */
router.post(
  '/register',
  validateBody(['email', 'password', 'name']),
  validateEmail,
  validatePassword,
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Trả về JWT token
 *       401:
 *         description: Sai email hoặc mật khẩu
 */
router.post(
  '/login',
  validateBody(['email', 'password']),
  validateEmail,
  login
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin user đang đăng nhập
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Thông tin user
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/me', authenticate, getMe);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Gửi email đặt lại mật khẩu
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *     responses:
 *       200:
 *         description: Đã gửi email nếu tồn tại
 */
router.post(
  '/forgot-password',
  validateBody(['email']),
  validateEmail,
  forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu bằng token từ email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 example: "newpass123"
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: Token không hợp lệ hoặc hết hạn
 */
router.post(
  '/reset-password',
  validateBody(['token', 'newPassword']),
  validatePassword,
  resetPassword
);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Đổi mật khẩu (khi đang đăng nhập)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu hiện tại không đúng
 */
router.put(
  '/change-password',
  authenticate,
  validateBody(['currentPassword', 'newPassword']),
  changePassword
);

export default router;