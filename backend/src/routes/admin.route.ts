// src/routes/admin.route.ts
import { Router } from 'express';
import { getSystemStats } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả admin routes đều cần authenticate và quyền admin
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Lấy thống kê tổng quan toàn hệ thống
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Trả về dữ liệu thống kê
 */
router.get('/stats', getSystemStats);

export default router;
