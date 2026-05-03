// src/routes/trends.route.ts
import { Router } from 'express';
import { getKeywords, getCompare, getYouTubeTrends, getSuggest } from '../controllers/trends.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/trends/keywords:
 *   get:
 *     summary: Lấy từ khóa đang trending (Google Trends VN)
 *     tags: [Trends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: geo
 *         schema:
 *           type: string
 *           default: VN
 *     responses:
 *       200:
 *         description: Danh sách từ khóa trending
 *       503:
 *         description: Google Trends không khả dụng
 */
router.get('/keywords', getKeywords);

/**
 * @swagger
 * /api/trends/compare:
 *   get:
 *     summary: So sánh mức độ quan tâm của nhiều từ khóa
 *     tags: [Trends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keywords
 *         required: true
 *         schema:
 *           type: string
 *           example: "AI Marketing,thời trang,du lịch"
 *         description: 2–5 từ khóa cách nhau bằng dấu phẩy
 *       - in: query
 *         name: geo
 *         schema:
 *           type: string
 *           default: VN
 *     responses:
 *       200:
 *         description: Dữ liệu so sánh theo thời gian (30 ngày)
 */
router.get('/compare', getCompare);

/**
 * @swagger
 * /api/trends/youtube:
 *   get:
 *     summary: Video đang trending trên YouTube VN
 *     tags: [Trends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: geo
 *         schema:
 *           type: string
 *           default: VN
 *     responses:
 *       200:
 *         description: Danh sách video trending
 *       503:
 *         description: YOUTUBE_API_KEY chưa được cấu hình
 */
router.get('/youtube', getYouTubeTrends);

/**
 * @swagger
 * /api/trends/suggest:
 *   get:
 *     summary: AI gợi ý chủ đề content từ xu hướng
 *     tags: [Trends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keywords
 *         required: true
 *         schema:
 *           type: string
 *           example: "AI Marketing,thời trang bền vững"
 *         description: Từ khóa cách nhau bằng dấu phẩy
 *     responses:
 *       200:
 *         description: Danh sách ý tưởng bài viết do AI gợi ý
 */
router.get('/suggest', getSuggest);

export default router;
