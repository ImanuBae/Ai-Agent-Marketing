// src/routes/content.route.ts
import { Router } from 'express';
import {
  createCaption, suggestHashtags, createProductDescription,
  getContentHistory, updateContent, deleteContent,
  saveTemplate, getTemplates, getContentStrategy,
} from '../controllers/content.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/content/generate:
 *   post:
 *     summary: Tạo caption bằng AI
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [brief, platform]
 *             properties:
 *               brief:
 *                 type: string
 *                 example: "Cửa hàng giày thể thao mới khai trương"
 *               platform:
 *                 type: string
 *                 enum: [facebook, linkedin, tiktok]
 *               tone:
 *                 type: string
 *                 example: "friendly"
 *     responses:
 *       200:
 *         description: Caption và hashtag được tạo thành công
 */
router.post('/generate',
  validateBody(['brief', 'platform']),
  createCaption
);

/**
 * @swagger
 * /api/content/hashtags:
 *   post:
 *     summary: Gợi ý hashtag từ nội dung
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, platform]
 *             properties:
 *               content:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [facebook, linkedin, tiktok]
 *     responses:
 *       200:
 *         description: Danh sách hashtag gợi ý
 */
router.post('/hashtags',
  validateBody(['content', 'platform']),
  suggestHashtags
);

/**
 * @swagger
 * /api/content/product-description:
 *   post:
 *     summary: Tạo mô tả sản phẩm bằng AI
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productName, features, targetAudience]
 *             properties:
 *               productName:
 *                 type: string
 *               features:
 *                 type: string
 *               targetAudience:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mô tả sản phẩm được tạo thành công
 */
router.post('/product-description',
  validateBody(['productName', 'features', 'targetAudience']),
  createProductDescription
);

/**
 * @swagger
 * /api/content/strategy:
 *   post:
 *     summary: Đề xuất chiến lược nội dung
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [industry, platform]
 *             properties:
 *               industry:
 *                 type: string
 *                 example: "thời trang"
 *               platform:
 *                 type: string
 *                 enum: [facebook, linkedin, tiktok]
 *     responses:
 *       200:
 *         description: Chiến lược nội dung được đề xuất
 */
router.post('/strategy',
  validateBody(['industry', 'platform']),
  getContentStrategy
);

/**
 * @swagger
 * /api/content/history:
 *   get:
 *     summary: Lịch sử nội dung đã tạo
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [facebook, linkedin, tiktok]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, scheduled, published]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách content có phân trang
 */
router.get('/history', getContentHistory);

/**
 * @swagger
 * /api/content/templates:
 *   post:
 *     summary: Lưu template nội dung
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, brief, platform]
 *             properties:
 *               name:
 *                 type: string
 *               brief:
 *                 type: string
 *               platform:
 *                 type: string
 *               tone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template được lưu thành công
 */
router.post('/templates',
  validateBody(['name', 'brief', 'platform']),
  saveTemplate
);

/**
 * @swagger
 * /api/content/templates:
 *   get:
 *     summary: Danh sách template đã lưu
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Danh sách template
 */
router.get('/templates', getTemplates);

router.put('/:id',    validateBody(['caption']), updateContent);
router.delete('/:id', deleteContent);

export default router;