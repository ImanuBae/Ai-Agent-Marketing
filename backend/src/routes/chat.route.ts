// src/routes/chat.route.ts
import { Router } from 'express';
import { handleChat } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Trò chuyện với trợ lý MarketAI
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sender:
 *                       type: string
 *                       enum: [user, ai]
 *                     text:
 *                       type: string
 *     responses:
 *       200:
 *         description: Phản hồi từ AI
 */
router.post('/', authenticate, handleChat);

export default router;
