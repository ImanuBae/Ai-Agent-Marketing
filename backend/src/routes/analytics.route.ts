import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getOverview } from '../controllers/analytics.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Content performance analytics
 */

/**
 * @swagger
 * /api/analytics/overview:
 *   get:
 *     summary: Get analytics overview for the authenticated user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data including content stats, platform breakdown, and engagement
 */
router.get('/overview', authenticate, getOverview);

export default router;
