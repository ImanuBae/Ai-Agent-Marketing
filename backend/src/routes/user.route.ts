// src/routes/user.route.ts
import { Router } from 'express';
import {
  updateProfile, uploadUserAvatar, getAllUsers, getUserById,
  toggleLockUser, deleteUser, toggleAdminRole, getApiQuotaStatus, testGeminiConnection,
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/auth.middleware';
import { avatarUpload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @swagger
 * /api/users/test/gemini:
 *   get:
 *     summary: Test kết nối Gemini API (không cần auth)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Kết nối thành công
 */
router.get('/test/gemini', testGeminiConnection);

// Tất cả routes dưới đây đều cần đăng nhập
router.use(authenticate);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/profile', updateProfile);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload avatar người dùng
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 */
router.post('/avatar', avatarUpload.single('avatar'), uploadUserAvatar);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: "[ADMIN] Lấy danh sách user"
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách user có phân trang
 *       403:
 *         description: Không có quyền
 */
router.get('/', requireAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: "[ADMIN] Xem chi tiết 1 user"
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin chi tiết user
 *       404:
 *         description: Không tìm thấy user
 */
router.get('/:id', requireAdmin, getUserById);

/**
 * @swagger
 * /api/users/{id}/toggle-lock:
 *   put:
 *     summary: "[ADMIN] Khóa / Mở khóa tài khoản"
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thay đổi trạng thái thành công
 */
router.put('/:id/toggle-lock', requireAdmin, toggleLockUser);

/**
 * @swagger
 * /api/users/{id}/toggle-admin:
 *   put:
 *     summary: "[ADMIN] Cấp / Thu hồi quyền Admin"
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thay đổi quyền thành công
 */
router.put('/:id/toggle-admin', requireAdmin, toggleAdminRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: "[ADMIN] Xóa tài khoản user"
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:id', requireAdmin, deleteUser);

/**
 * @swagger
 * /api/users/quota/status:
 *   get:
 *     summary: Kiểm tra quota API Gemini còn lại
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Thông tin quota
 */
router.get('/quota/status', getApiQuotaStatus);

export default router;