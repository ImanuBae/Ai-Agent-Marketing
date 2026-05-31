import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/prisma';

import { sendSuccess, sendError } from '../utils/response';
import { narrateCampaignAnalysis } from '../services/gemini.service';
import {
  buildDetailedMlAnalysisText,
  extractPlatformTrainingRows,
  MlInputError,
  scoreCampaign,
} from '../services/ml-campaign.service';

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
// Evaluates every sheet and returns the table with the most columns × data rows.
function smartParseExcel(workbook: XLSX.WorkBook): Record<string, unknown>[] {
  let best: { dataRows: Record<string, unknown>[]; score: number } | null = null;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null });
    if (raw.length === 0) continue;

    // Header row = first row (within first 40) with ≥2 non-empty cells where
    // most cells look like labels (strings), not a lone title/logo row.
    let headerRowIdx = -1;
    let headerColCount = 0;
    for (let i = 0; i < Math.min(raw.length, 40); i++) {
      const row = raw[i] as unknown[];
      const nonEmpty = row.filter(v => v !== null && v !== undefined && v !== '');
      if (nonEmpty.length < 2) continue;

      const labelLike = nonEmpty.filter(v => typeof v === 'string' || typeof v === 'boolean').length;
      if (labelLike < Math.ceil(nonEmpty.length / 2)) continue;

      if (nonEmpty.length > headerColCount) {
        headerColCount = nonEmpty.length;
        headerRowIdx = i;
      }
    }

    if (headerRowIdx < 0) continue;

    const headerRow = raw[headerRowIdx] as unknown[];
    const headers = headerRow.map((h, i) =>
      (h !== null && h !== undefined && String(h).trim() !== '')
        ? String(h).trim()
        : `Col${i + 1}`
    );

    const dataRows: Record<string, unknown>[] = [];
    for (let i = headerRowIdx + 1; i < raw.length; i++) {
      const row = raw[i] as unknown[];
      const hasValue = row.some(v => v !== null && v !== undefined && v !== '');
      if (!hasValue) continue;
      const obj: Record<string, unknown> = {};
      // Always emit every header key so column count is stable (merged/sparse cells).
      headers.forEach((h, j) => { obj[h] = row[j] ?? null; });
      dataRows.push(obj);
    }

    if (dataRows.length === 0) continue;

    const score = headers.length * dataRows.length;
    if (!best || score > best.score) best = { dataRows, score };
  }

  return best?.dataRows ?? [];
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

    const columnCount = rows.length > 0 ? Object.keys(rows[0]).length : 0;
    if (columnCount < 2) {
      return sendError(
        res,
        'Báo cáo này chỉ có 1 cột (file đã upload trước khi sửa parser). Vui lòng upload lại file Excel.',
        400,
      );
    }

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

    const mlInsights = scoreCampaign(rows);

    let analysisText = buildDetailedMlAnalysisText(mlInsights);
    try {
      analysisText = await narrateCampaignAnalysis(rows, mlInsights);
    } catch (error) {
      console.warn('Gemini narrative unavailable, using ML template text:', error);
    }

    const analysis = await prisma.campaignAnalysis.create({
      data: {
        userId,
        salesReportId,
        analysisText,
        recommendation: mlInsights.recommendation,
        effectivenessScore: mlInsights.effectivenessScore,
        mlInsights: mlInsights as object,
      },
    });

    if (mlInsights.analysisMode === 'channel' && mlInsights.modelVersion === 'platform-baseline-v1') {
      const trainingRows = extractPlatformTrainingRows(rows);
      if (trainingRows.length >= 3) {
        await prisma.$executeRaw`
          INSERT INTO "platform_training_snapshots"
            ("id", "userId", "salesReportId", "rowCount", "rows", "updatedAt")
          VALUES
            (${`pts_${salesReportId}`}, ${userId}, ${salesReportId}, ${trainingRows.length}, ${JSON.stringify(trainingRows)}::jsonb, NOW())
          ON CONFLICT ("salesReportId") DO UPDATE SET
            "rowCount" = EXCLUDED."rowCount",
            "rows" = EXCLUDED."rows",
            "updatedAt" = NOW()
        `;
      }
    }

    const { mappedColumns } = mlInsights;
    const chartData = rows.map(r => ({
      date:     String(r[mappedColumns.date ?? dateCol] ?? ''),
      revenue:  Number(r[mappedColumns.sales ?? ''] ?? 0),
      activity: 0,
    }));

    mlInsights.predictedVsActual.forEach((point, index) => {
      if (chartData[index]) chartData[index].activity = point.predicted;
    });

    return sendSuccess(res, 'Phân tích hoàn tất', {
      id: analysis.id,
      salesReportId,
      analysisText: analysis.analysisText,
      recommendation: analysis.recommendation,
      effectivenessScore: analysis.effectivenessScore,
      rowsAnalyzed: rows.length,
      createdAt: analysis.createdAt,
      revenueLabel: mappedColumns.sales ?? 'Doanh thu',
      activityLabel: 'Dự đoán ML',
      chartData,
      ml: mlInsights,
    });
  } catch (error: any) {
    if (error instanceof MlInputError) {
      return sendError(res, error.message, error.status);
    }
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

export const getPlatformSampleFile = (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, '../../data/sample-platform-campaign.xlsx');
  if (!fs.existsSync(filePath)) {
    return sendError(res, 'File mau platform chua duoc tao', 404);
  }
  res.download(filePath, 'sample-platform-campaign.xlsx');
};
