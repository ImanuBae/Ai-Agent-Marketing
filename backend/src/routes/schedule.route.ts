import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as ctrl from '../controllers/schedule.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Schedule
 *   description: AI-powered content scheduling & engagement optimizer
 */

/**
 * @swagger
 * /api/schedule:
 *   post:
 *     summary: Schedule a post (omit scheduledAt to let AI pick the optimal time)
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contentId]
 *             properties:
 *               contentId:
 *                 type: string
 *                 description: ID of an existing draft Content
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-05-10T14:00:00.000Z"
 *                 description: "UTC datetime; omit to activate AI optimizer"
 *               timezone:
 *                 type: string
 *                 example: Asia/Ho_Chi_Minh
 *               timezoneOffset:
 *                 type: integer
 *                 description: Hours ahead of UTC (e.g. 7 for UTC+7)
 *                 example: 7
 *     responses:
 *       201:
 *         description: Schedule created
 *       400:
 *         description: Validation or conflict error
 */
router.post('/', authenticate, ctrl.createSchedule);

/**
 * @swagger
 * /api/schedule:
 *   get:
 *     summary: List scheduled posts
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, published, failed]
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           example: 4
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *     responses:
 *       200:
 *         description: Array of schedules with embedded content
 */
router.get('/', authenticate, ctrl.getSchedules);

/**
 * @swagger
 * /api/schedule/optimal-time:
 *   get:
 *     summary: Get AI-recommended posting windows for a platform
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           example: instagram
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 3
 *       - in: query
 *         name: timezoneOffset
 *         schema:
 *           type: integer
 *           example: 7
 *     responses:
 *       200:
 *         description: Top N time slots with avgScore and sampleCount
 */
router.get('/optimal-time', authenticate, ctrl.getOptimalTime);

/**
 * @swagger
 * /api/schedule/engagement:
 *   post:
 *     summary: Record real engagement metrics to train the optimizer (learning loop)
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contentId]
 *             properties:
 *               contentId:
 *                 type: string
 *               likes:
 *                 type: integer
 *                 default: 0
 *               comments:
 *                 type: integer
 *                 default: 0
 *               clicks:
 *                 type: integer
 *                 default: 0
 *               impressions:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       200:
 *         description: Engagement stored and optimizer updated
 */
router.post('/engagement', authenticate, ctrl.recordEngagement);

/**
 * @swagger
 * /api/schedule/{id}:
 *   put:
 *     summary: Reschedule a pending post to a new time
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scheduledAt]
 *             properties:
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Schedule updated
 *       404:
 *         description: Not found or already executed
 */
router.put('/:id', authenticate, ctrl.updateSchedule);

/**
 * @swagger
 * /api/schedule/{id}:
 *   delete:
 *     summary: Cancel a pending scheduled post
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schedule cancelled
 *       404:
 *         description: Not found or already executed
 */
router.delete('/:id', authenticate, ctrl.deleteSchedule);

export default router;
