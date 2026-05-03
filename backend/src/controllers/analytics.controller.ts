import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

// GET /api/analytics/overview
export const getOverview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [byStatus, byPlatform, scheduleStats, engagementStats, contentOverTime] =
      await Promise.all([
        // Content counts by status
        prisma.content.groupBy({
          by: ['status'],
          where: { userId },
          _count: { status: true },
        }),

        // Content counts by platform
        prisma.content.groupBy({
          by: ['platform'],
          where: { userId },
          _count: { platform: true },
          orderBy: { _count: { platform: 'desc' } },
        }),

        // Schedule stats
        prisma.schedule.groupBy({
          by: ['status'],
          where: { userId },
          _count: { status: true },
        }),

        // Engagement summary
        prisma.engagementData.aggregate({
          where: { userId },
          _sum: { likes: true, comments: true, clicks: true, impressions: true },
          _avg: { score: true },
          _count: { id: true },
        }),

        // Content created per day — last 30 days
        prisma.$queryRaw<{ date: string; count: bigint }[]>`
          SELECT DATE("createdAt") AS date, COUNT(*) AS count
          FROM "contents"
          WHERE "userId" = ${userId}
            AND "createdAt" >= NOW() - INTERVAL '30 days'
          GROUP BY DATE("createdAt")
          ORDER BY date ASC
        `,
      ]);

    // Normalise groupBy results
    const statusMap: Record<string, number> = {};
    for (const row of byStatus) statusMap[row.status] = row._count.status;

    const platformData = byPlatform.map((row) => ({
      platform: row.platform,
      count: row._count.platform,
    }));

    const scheduleMap: Record<string, number> = {};
    for (const row of scheduleStats) scheduleMap[row.status] = row._count.status;

    return sendSuccess(res, 'Analytics overview', {
      content: {
        total: Object.values(statusMap).reduce((a, b) => a + b, 0),
        draft: statusMap['draft'] ?? 0,
        scheduled: statusMap['scheduled'] ?? 0,
        published: statusMap['published'] ?? 0,
      },
      byPlatform: platformData,
      schedules: {
        pending: scheduleMap['pending'] ?? 0,
        published: scheduleMap['published'] ?? 0,
        failed: scheduleMap['failed'] ?? 0,
      },
      engagement: {
        totalLikes: engagementStats._sum.likes ?? 0,
        totalComments: engagementStats._sum.comments ?? 0,
        totalClicks: engagementStats._sum.clicks ?? 0,
        totalImpressions: engagementStats._sum.impressions ?? 0,
        avgScore: engagementStats._avg.score
          ? Math.round(engagementStats._avg.score * 10) / 10
          : null,
        trackedPosts: engagementStats._count.id,
      },
      contentOverTime: contentOverTime.map((row) => ({
        date: row.date,
        count: Number(row.count),
      })),
    });
  } catch (error) {
    return sendError(res, 'Không thể tải analytics', 500, error);
  }
};
