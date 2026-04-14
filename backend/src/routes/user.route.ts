// src/routes/user.route.ts
import { Router } from 'express';
import {
  updateProfile, getAllUsers, getUserById,
  toggleLockUser, deleteUser, toggleAdminRole,
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả routes đều cần đăng nhập
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

export default router;