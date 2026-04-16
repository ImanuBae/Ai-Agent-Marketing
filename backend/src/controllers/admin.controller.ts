// src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalPosts, totalSchedules] = await Promise.all([
      prisma.user.count(),
      prisma.content.count(),
      prisma.schedule.count(),
    ]);

    // Set untracked metrics to 0 or fixed neutral values as requested
    const mockStats = {
      aiTokensUsed: 0, 
      conversionRate: 0,
      activeCampaigns: totalSchedules, // This is real data from DB
      apiServerStatus: "Stable",
      aiGatewayStatus: "Stable",
      databaseStatus: "Active",
      storageUsage: 0,
      recentAlerts: [
        { title: "Hệ thống sẵn sàng", time: "Vừa xong", type: "success" },
      ]
    };

    return sendSuccess(res, 'Lấy thống kê hệ thống thành công', {
      totalUsers,
      totalPosts,
      totalSchedules,
      ...mockStats
    });
  } catch (error) {
    return sendError(res, 'Lỗi server', 500, error);
  }
};
