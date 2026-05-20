import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/prisma';

import { sendSuccess, sendError } from '../utils/response';
import { analyzeCampaign as geminiAnalyzeCampaign } from '../services/gemini.service';

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

// Parses any Excel — handles complex layouts with logos, titles, merged cells.
// Scans all sheets and all rows to find the best data table automatically.
function smartParseExcel(workbook: XLSX.WorkBook): Record<string, unknown>[] {
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null });

    // Find the row with the most non-empty cells → that's the header row
    let headerRowIdx = 0;
    let maxNonEmpty = 0;
    for (let i = 0; i < Math.min(raw.length, 40); i++) {
      const row = raw[i] as unknown[];
      const count = row.filter(v => v !== null && v !== undefined && v !== '').length;
      if (count > maxNonEmpty) { maxNonEmpty = count; headerRowIdx = i; }
    }

    if (maxNonEmpty < 2) continue; // This sheet has no usable table

    // Build header names — blank cells get generic names Col1, Col2...
    const headerRow = raw[headerRowIdx] as unknown[];
    const headers = headerRow.map((h, i) =>
      (h !== null && h !== undefined && String(h).trim() !== '')
        ? String(h).trim()
        : `Col${i + 1}`
    );

    // Collect data rows after the header, skip fully-empty rows
    const dataRows: Record<string, unknown>[] = [];
    for (let i = headerRowIdx + 1; i < raw.length; i++) {
      const row = raw[i] as unknown[];
      const hasValue = row.some(v => v !== null && v !== undefined && v !== '');
      if (!hasValue) continue;
      const obj: Record<string, unknown> = {};
      headers.forEach((h, j) => { if (row[j] !== null) obj[h] = row[j]; });
      dataRows.push(obj);
    }

    if (dataRows.length > 0) return dataRows;
  }
  return [];
}

// POST /api/analytics/sales-report  (multipart/form-data, field: "file")
export const uploadSalesReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const file = req.file;

    if (!file) return sendError(res, 'Vui lòng chọn file Excel hoặc CSV', 400);

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const rows = smartParseExcel(workbook);

    if (rows.length === 0) {
      return sendError(res, 'Không tìm thấy bảng dữ liệu trong file. Đảm bảo file có ít nhất 1 bảng với tiêu đề cột.', 400);
    }

    const report = await prisma.salesReport.create({
      data: {
        userId,
        fileName: file.originalname,
        data: rows as object[],
      },
    });

    return sendSuccess(res, 'Upload thành công', {
      id: report.id,
      fileName: report.fileName,
      rowCount: rows.length,
      createdAt: report.createdAt,
    });
  } catch (error) {
    return sendError(res, 'Không thể xử lý file', 500, error);
  }
};

// GET /api/analytics/sales-reports
export const getSalesReports = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const reports = await prisma.salesReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        createdAt: true,
        data: true,
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            recommendation: true,
            effectivenessScore: true,
            createdAt: true,
          },
        },
      },
    });

    const result = reports.map(r => ({
      id: r.id,
      fileName: r.fileName,
      createdAt: r.createdAt,
      rowCount: Array.isArray(r.data) ? (r.data as unknown[]).length : 0,
      latestAnalysis: r.analyses[0] ?? null,
    }));

    return sendSuccess(res, 'Danh sách báo cáo doanh số', result);
  } catch (error) {
    return sendError(res, 'Không thể tải danh sách báo cáo', 500, error);
  }
};

// POST /api/analytics/analyze-campaign
export const analyzeCampaignHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { salesReportId, startDate, endDate } = req.body as {
      salesReportId: string;
      startDate?: string;
      endDate?: string;
    };

    if (!salesReportId) return sendError(res, 'salesReportId là bắt buộc', 400);

    const report = await prisma.salesReport.findUnique({
      where: { id: salesReportId },
    });

    if (!report || report.userId !== userId) {
      return sendError(res, 'Không tìm thấy báo cáo doanh số', 404);
    }

    let rows = (report.data as Record<string, unknown>[]);

    // Auto-detect date column (handles any language)
    const allHeaders = rows.length > 0 ? Object.keys(rows[0]) : [];
    const dateCol = allHeaders.find(h =>
      /date|ngày|ngay|thời gian|time|week|month|tháng/i.test(h)
    ) ?? allHeaders[0]; // fallback to first column

    // Filter by date range if provided
    if ((startDate || endDate) && dateCol) {
      rows = rows.filter(r => {
        const d = String(r[dateCol] ?? '');
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }

    if (rows.length === 0) {
      return sendError(res, 'Không có dữ liệu trong khoảng thời gian đã chọn', 400);
    }

    const aiResult = await geminiAnalyzeCampaign(rows);

    const analysis = await prisma.campaignAnalysis.create({
      data: {
        userId,
        salesReportId,
        analysisText: aiResult.analysisText,
        recommendation: aiResult.recommendation,
        effectivenessScore: aiResult.effectivenessScore,
      },
    });

    // Build chart data using AI-identified columns
    const { dateColumn, revenueColumn, activityColumn } = aiResult;
    const chartData = rows.map(r => ({
      date:     String(r[dateColumn ?? dateCol] ?? ''),
      revenue:  Number(r[revenueColumn ?? ''] ?? 0),
      activity: Number(r[activityColumn ?? ''] ?? 0),
    }));

    return sendSuccess(res, 'Phân tích hoàn tất', {
      id: analysis.id,
      salesReportId,
      analysisText: analysis.analysisText,
      recommendation: analysis.recommendation,
      effectivenessScore: analysis.effectivenessScore,
      rowsAnalyzed: rows.length,
      createdAt: analysis.createdAt,
      revenueLabel: revenueColumn ?? 'Doanh thu',
      activityLabel: activityColumn ?? 'Hoạt động',
      chartData,
    });
  } catch (error: any) {
    if (error?.status === 503 || error?.name === 'QuotaExhaustedError') {
      return sendError(res, 'Quota AI đã hết, vui lòng thử lại vào ngày mai', 503);
    }
    return sendError(res, 'Không thể phân tích chiến dịch', 500, error);
  }
};

// GET /api/analytics/sample-file  — redirect to static sample Excel
export const getSampleFile = (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, '../../data/sample-campaign-skincare.xlsx');
  if (!fs.existsSync(filePath)) {
    return sendError(res, 'File mẫu chưa được tạo', 404);
  }
  res.download(filePath, 'sample-campaign-skincare.xlsx');
};
