import fs from 'fs';
import path from 'path';

type Recommendation = 'continue' | 'pivot' | 'stop';
type FeatureName = string;

interface MarketingModel {
  version: string;
  features: FeatureName[];
  target: string;
  intercept: number;
  coefficients: Record<FeatureName, number>;
  metrics: {
    test: {
      r2: number;
      mae: number;
      rmse: number;
    };
  };
  featureImportance: Record<FeatureName, {
    standardizedCoefficient: number;
    share: number;
  }>;
  featureStatistics: Record<FeatureName, {
    mean: number;
    std: number;
    min: number;
    max: number;
  }>;
  scaleHints: {
    spendVndPerDatasetUnit: number;
    salesVndPerDatasetUnit: number;
  };
}

interface MappedColumns {
  date?: string;
  youtube?: string;
  facebook?: string;
  newspaper?: string;
  instagram?: string;
  threads?: string;
  tiktok?: string;
  totalSpend?: string;
  sales?: string;
  impressions?: string;
  clicks?: string;
  orders?: string;
  conversions?: string;
  cpc?: string;
  cpm?: string;
  roas?: string;
  ctr?: string;
  inferred?: boolean;
}

interface MlRow {
  date: string;
  spendsOriginal: Record<string, number>;
  spendsDataset: Record<string, number>;
  actual: number | null;
  predicted: number;
}

export interface MlCampaignInsights {
  analysisMode: 'channel' | 'totalSpend';
  modelVersion: string;
  modelR2: number;
  userR2: number | null;
  mape: number | null;
  effectivenessScore: number;
  recommendation: Recommendation;
  mappedColumns: MappedColumns;
  channelImpact: Record<FeatureName, 'high' | 'medium' | 'low'>;
  channelCoefficients: Record<FeatureName, number>;
  predictedVsActual: Array<{
    date: string;
    actual: number | null;
    predicted: number;
    channels: Record<string, number>;
    youtube?: number;
    facebook?: number;
    newspaper?: number;
    instagram?: number;
    threads?: number;
    tiktok?: number;
  }>;
  suggestedBudgetShift: string;
  deepDive: {
    summary: {
      rowsAnalyzed: number;
      totalActual: number | null;
      totalPredicted: number;
      totalSpend: number;
      avgRoi: number | null;
      avgPredictionErrorPct: number | null;
      bestPeriod?: string;
      weakestPeriod?: string;
      anomalyCount: number;
    };
    periodBreakdown: Array<{
      date: string;
      actual: number | null;
      predicted: number;
      totalSpend: number;
      roi: number | null;
      predictionErrorPct: number | null;
      flag?: 'best' | 'weak' | 'overperform' | 'underperform';
    }>;
    channelDiagnostics: Array<{
      channel: string;
      totalSpend: number;
      spendShare: number;
      coefficient: number;
      impact: 'high' | 'medium' | 'low';
      efficiencyIndex: number;
      recommendation: string;
    }>;
    monthlyPivot: Array<{
      month: string;
      rows: number;
      actual: number | null;
      predicted: number;
      spend: number;
      roi: number | null;
    }>;
    chartTemplates: {
      spendByChannel: Array<{ channel: string; spend: number; share: number }>;
      monthlyPerformance: Array<{ month: string; actual: number | null; predicted: number; spend: number; roi: number | null }>;
      errorTrend: Array<{ date: string; errorPct: number | null }>;
      roiTrend: Array<{ month: string; roi: number | null }>;
      expenseBreakdown: Array<{ item: string; total: number; share: number }>;
      profitTrend: Array<{ month: string; revenue: number; expenses: number; profit: number; margin: number | null }>;
    };
    financialBreakdown: Array<{
      type: 'revenue' | 'reduction' | 'expense' | 'profit';
      item: string;
      total: number;
      share: number;
      monthly: Array<{ month: string; value: number }>;
    }>;
    profitabilityByMonth: Array<{
      month: string;
      revenue: number;
      reductions: number;
      grossProfit: number;
      expenses: number;
      profit: number;
      margin: number | null;
    }>;
    funnelMetrics: Array<{
      metric: string;
      column: string;
      total: number;
      average: number;
    }>;
    detectedSignals: Array<{
      metric: string;
      column: string;
      total: number;
      average: number;
      trendPct: number | null;
    }>;
    insights: string[];
  };
  warning?: string;
}

export class MlInputError extends Error {
  status = 400;
}

export interface PlatformTrainingRow {
  facebook: number;
  instagram: number;
  threads: number;
  tiktok: number;
  sales: number;
}

const MODEL_PATHS = {
  legacy: path.join(__dirname, '../../ml/artifacts/marketing-baseline-v1.json'),
  platform: path.join(__dirname, '../../ml/artifacts/platform-baseline-v1.json'),
};

const cachedModels: Partial<Record<keyof typeof MODEL_PATHS, MarketingModel>> = {};

function getModel(kind: keyof typeof MODEL_PATHS): MarketingModel {
  if (!cachedModels[kind]) {
    cachedModels[kind] = JSON.parse(fs.readFileSync(MODEL_PATHS[kind], 'utf-8')) as MarketingModel;
  }
  return cachedModels[kind] as MarketingModel;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;

  const cleaned = value
    .replace(/[^\d,.-]/g, '')
    .replace(/(?!^)-/g, '');

  if (!cleaned) return null;

  const normalized = cleaned
    .replace(/[.,](?=\d{3}(\D|$))/g, '')
    .replace(',', '.');

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function findColumn(headers: string[], patterns: RegExp[]): string | undefined {
  return headers.find(header => {
    const normalized = normalize(header);
    return patterns.some(pattern => pattern.test(normalized));
  });
}

const MONTH_LABELS: Record<string, string> = {
  january: 'January',
  february: 'February',
  march: 'March',
  april: 'April',
  may: 'May',
  june: 'June',
  july: 'July',
  august: 'August',
  september: 'September',
  october: 'October',
  november: 'November',
  december: 'December',
  'thang 1': 'Tháng 1',
  'thang 2': 'Tháng 2',
  'thang 3': 'Tháng 3',
  'thang 4': 'Tháng 4',
  'thang 5': 'Tháng 5',
  'thang 6': 'Tháng 6',
  'thang 7': 'Tháng 7',
  'thang 8': 'Tháng 8',
  'thang 9': 'Tháng 9',
  'thang 10': 'Tháng 10',
  'thang 11': 'Tháng 11',
  'thang 12': 'Tháng 12',
};

function isMonthColumn(header: string): boolean {
  return Boolean(MONTH_LABELS[normalize(header)]);
}

function monthLabel(header: string): string {
  return MONTH_LABELS[normalize(header)] ?? header;
}

function findMetricRow(rows: Record<string, unknown>[], labelColumn: string, patterns: RegExp[]) {
  return rows.find(row => {
    const label = normalize(String(row[labelColumn] ?? ''));
    return patterns.some(pattern => pattern.test(label));
  });
}

function findBestMetricRow(rows: Record<string, unknown>[], labelColumn: string, patternGroups: RegExp[][]) {
  for (const patterns of patternGroups) {
    const row = findMetricRow(rows, labelColumn, patterns);
    if (row) return row;
  }
  return undefined;
}

function numericColumnSummaries(rows: Record<string, unknown>[]) {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return headers.map(header => {
    const values = getNumericColumn(rows, header);
    return {
      header,
      count: values.length,
      sum: values.reduce((total, value) => total + value, 0),
    };
  }).filter(summary => summary.count >= Math.min(2, rows.length) && summary.sum > 0);
}

function adaptWideMonthlyFinancialRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  if (rows.length === 0) return rows;

  const headers = Object.keys(rows[0]);
  const monthColumns = headers.filter(isMonthColumn);
  if (monthColumns.length < 2) return rows;

  const labelColumn = headers.find(header =>
    rows.some(row => typeof row[header] === 'string' && String(row[header]).trim() !== '')
  );
  if (!labelColumn) return rows;

  const revenueRow = findBestMetricRow(rows, labelColumn, [
    [/^total revenue$/, /^tong doanh thu$/],
    [/income from sales/, /^sales$/, /^revenue$/, /^doanh thu$/],
    [/gross profit/, /loi nhuan gop/],
    [/income/],
  ]);
  const expenseRow = findBestMetricRow(rows, labelColumn, [
    [/^total expenses$/, /^tong chi phi$/],
    [/tong.*expense/, /total.*cost/],
    [/expenses/],
    [/chi phi/],
    [/spend/, /advertising/, /marketing/],
  ]);

  if (!revenueRow || !expenseRow) return rows;

  return monthColumns.map(month => ({
    'Tháng': monthLabel(month),
    'Doanh thu': parseNumber(revenueRow[month]) ?? 0,
    'Tổng chi phí': parseNumber(expenseRow[month]) ?? 0,
  })).filter(row => Number(row['Doanh thu']) > 0 || Number(row['Tổng chi phí']) > 0);
}

export function mapUserColumns(rows: Record<string, unknown>[]): MappedColumns {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  const mapped: MappedColumns = {
    date: findColumn(headers, [/^date$/, /ngay/, /thoi gian/, /week/, /month/, /thang/]),
    youtube: findColumn(headers, [/youtube/, /\byt\b/, /you tube/]),
    facebook: findColumn(headers, [/facebook/, /\bfb\b/, /meta/]),
    newspaper: findColumn(headers, [/newspaper/, /\bbao\b/, /bao chi/, /print/, /paper/]),
    instagram: findColumn(headers, [/instagram/, /\big\b/]),
    threads: findColumn(headers, [/threads?/, /\bthread\b/]),
    tiktok: findColumn(headers, [/tiktok/, /tik tok/]),
    totalSpend: findColumn(headers, [
      /tong.*(chi phi|qc|quang cao|ads|spend)/,
      /total.*(spend|ads|cost)/,
      /total.*expense/,
      /^expense/,
      /expenses/,
      /chi phi/,
      /\bcost\b/,
      /\bspend\b/,
      /advertising/,
      /marketing/,
    ]),
    sales: findColumn(headers, [/sales/, /doanh thu/, /doanh so/, /revenue/, /income/, /gross profit/, /loi nhuan gop/]),
    impressions: findColumn(headers, [/impressions?/, /hien thi/, /luot hien thi/, /reach/, /views?/]),
    clicks: findColumn(headers, [/clicks?/, /luot click/, /nhap chuot/, /\bctr clicks?\b/]),
    orders: findColumn(headers, [/orders?/, /don hang/, /purchases?/, /transactions?/]),
    conversions: findColumn(headers, [/conversions?/, /chuyen doi/, /leads?/, /signups?/]),
    cpc: findColumn(headers, [/^cpc$/, /cost per click/, /chi phi.*click/]),
    cpm: findColumn(headers, [/^cpm$/, /cost per mille/, /cost per thousand/, /chi phi.*1000/]),
    roas: findColumn(headers, [/^roas$/, /return.*ad.*spend/, /doanh thu.*chi phi/]),
    ctr: findColumn(headers, [/^ctr$/, /click.*through/, /ty le click/]),
  };

  const directSpendFeatureCount = Number(Boolean(mapped.youtube))
    + Number(Boolean(mapped.facebook))
    + Number(Boolean(mapped.newspaper))
    + Number(Boolean(mapped.instagram))
    + Number(Boolean(mapped.threads))
    + Number(Boolean(mapped.tiktok));

  if (false && ((!mapped.totalSpend && directSpendFeatureCount < 2) || !mapped.sales)) {
    throw new MlInputError(
      'File cần có ít nhất 2 cột chi phí kênh quảng cáo hoặc 1 cột tổng chi phí, kèm 1 cột doanh thu/sales để chạy ML.',
    );
  }

  const numericColumns = numericColumnSummaries(rows)
    .filter(summary => summary.header !== mapped.date)
    .sort((a, b) => b.sum - a.sum);

  if (!mapped.sales && numericColumns.length > 0) {
    mapped.sales = numericColumns[0].header;
    mapped.inferred = true;
  }

  if (!mapped.totalSpend && directSpendFeatureCount < 2) {
    const spendCandidate = numericColumns.find(summary => summary.header !== mapped.sales);
    if (spendCandidate) {
      mapped.totalSpend = spendCandidate.header;
      mapped.inferred = true;
    }
  }

  const hasMappedSpend = Boolean(mapped.totalSpend)
    || Boolean(mapped.youtube)
    || Boolean(mapped.facebook)
    || Boolean(mapped.newspaper);

  if (!hasMappedSpend || !mapped.sales) {
    throw new MlInputError(
      'File chưa có đủ dữ liệu số để phân tích. Cần ít nhất 1 cột doanh thu/kết quả và 1 cột chi phí/hoạt động.',
    );
  }

  return mapped;
}

function headerLooksVnd(header?: string): boolean {
  if (!header) return false;
  return /vnd|vnđ|dong|₫/i.test(normalize(header));
}

function shouldTreatAsVnd(values: number[], header?: string): boolean {
  if (headerLooksVnd(header)) return true;
  return false;
}

function getNumericColumn(rows: Record<string, unknown>[], column?: string): number[] {
  if (!column) return [];
  return rows
    .map(row => parseNumber(row[column]))
    .filter((value): value is number => value !== null && value >= 0);
}

function predictDatasetSales(spendsDataset: Record<string, number>, model: MarketingModel): number {
  return model.intercept
    + model.features.reduce((sum, feature) => {
      return sum + model.coefficients[feature] * (spendsDataset[feature] ?? 0);
    }, 0);
}

function userR2(rows: MlRow[]): number | null {
  const pairs = rows.filter(row => row.actual !== null);
  if (pairs.length < 2) return null;

  const actual = pairs.map(row => row.actual as number);
  const meanActual = actual.reduce((sum, value) => sum + value, 0) / actual.length;
  const ssRes = pairs.reduce((sum, row) => sum + Math.pow((row.actual as number) - row.predicted, 2), 0);
  const ssTot = actual.reduce((sum, value) => sum + Math.pow(value - meanActual, 2), 0);

  return ssTot > 0 ? 1 - ssRes / ssTot : null;
}

function userMape(rows: MlRow[]): number | null {
  const pairs = rows.filter(row => row.actual !== null && row.actual > 0);
  if (pairs.length === 0) return null;

  return pairs.reduce((sum, row) => {
    return sum + Math.abs((row.actual as number) - row.predicted) / (row.actual as number);
  }, 0) / pairs.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function recommendationFromScore(score: number): Recommendation {
  if (score >= 66) return 'continue';
  if (score >= 41) return 'pivot';
  return 'stop';
}

function scoreCampaignRows(rows: MlRow[], model: MarketingModel): {
  score: number;
  recommendation: Recommendation;
  mape: number | null;
  r2: number | null;
} {
  const mape = userMape(rows);
  const r2 = userR2(rows);
  const r2Component = r2 ?? model.metrics.test.r2;
  const mapeComponent = mape === null ? 0.5 : 1 - mape;
  const score = Math.round(clamp(50 + 30 * mapeComponent + 20 * r2Component, 0, 100));

  return {
    score,
    recommendation: recommendationFromScore(score),
    mape,
    r2,
  };
}

function scoreGenericFinancialRows(rows: MlRow[]): {
  score: number;
  recommendation: Recommendation;
  mape: number | null;
  r2: number | null;
} {
  const rowsWithActual = rows.filter(row => row.actual !== null && row.actual > 0);
  if (rowsWithActual.length === 0) {
    return { score: 50, recommendation: 'pivot', mape: null, r2: null };
  }

  const margins = rowsWithActual.map(row => {
    const totalCost = Object.values(row.spendsOriginal)
      .reduce((sum, value) => sum + value, 0);
    return ((row.actual as number) - totalCost) / (row.actual as number);
  });
  const avgMargin = margins.reduce((sum, value) => sum + value, 0) / margins.length;
  const profitableShare = margins.filter(value => value > 0).length / margins.length;
  const score = Math.round(clamp(50 + 50 * avgMargin + 20 * (profitableShare - 0.5), 0, 100));

  return {
    score,
    recommendation: recommendationFromScore(score),
    mape: null,
    r2: null,
  };
}

function classifyImpact(share: number): 'high' | 'medium' | 'low' {
  if (share >= 0.45) return 'high';
  if (share >= 0.2) return 'medium';
  return 'low';
}

function suggestBudgetShift(model: MarketingModel): string {
  const sorted = model.features
    .slice()
    .sort((a, b) => model.featureImportance[b].share - model.featureImportance[a].share);

  const labels: Record<FeatureName, string> = {
    youtube: 'YouTube',
    facebook: 'Facebook',
    instagram: 'Instagram',
    threads: 'Threads',
    tiktok: 'TikTok',
    newspaper: 'Báo/Newspaper',
  };

  return `Tăng thử nghiệm ${labels[sorted[0]]} khoảng 10-15%, giảm ${labels[sorted[sorted.length - 1]]} khoảng 5-10% nếu ngân sách cố định.`;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function safeRatio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function monthKey(label: string): string {
  const parsed = new Date(label);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
  }

  return label || 'Unknown';
}

function featureLabel(feature: string): string {
  const labels: Record<string, string> = {
    youtube: 'YouTube',
    facebook: 'Facebook',
    instagram: 'Instagram',
    threads: 'Threads',
    tiktok: 'TikTok',
    newspaper: 'Newspaper',
  };

  return labels[feature] ?? feature;
}

function trendPct(values: number[]): number | null {
  if (values.length < 2) return null;
  const first = values[0];
  const last = values[values.length - 1];
  return first > 0 ? (last - first) / first : null;
}

function signalRows(rows: Record<string, unknown>[], mapped: MappedColumns) {
  const definitions: Array<{ metric: string; column?: string }> = [
    { metric: 'Impressions', column: mapped.impressions },
    { metric: 'Clicks', column: mapped.clicks },
    { metric: 'Orders', column: mapped.orders },
    { metric: 'Conversions', column: mapped.conversions },
    { metric: 'CPC', column: mapped.cpc },
    { metric: 'CPM', column: mapped.cpm },
    { metric: 'ROAS', column: mapped.roas },
    { metric: 'CTR', column: mapped.ctr },
  ];

  return definitions.flatMap(definition => {
    if (!definition.column) return [];
    const values = getNumericColumn(rows, definition.column);
    if (values.length === 0) return [];

    return [{
      metric: definition.metric,
      column: definition.column,
      total: sum(values),
      average: sum(values) / values.length,
      trendPct: trendPct(values),
    }];
  });
}

function financialRowType(label: string): 'revenue' | 'reduction' | 'expense' | 'profit' | null {
  const normalized = normalize(label);
  if (!normalized || normalized === 'other') return null;
  if (/profit|loss|loi nhuan|lai lo/.test(normalized)) return 'profit';
  if (/reduction|return|discount|cost of goods|cogs|giam tru/.test(normalized)) return 'reduction';
  if (/income|revenue|sales|doanh thu|interest received|gains/.test(normalized)) return 'revenue';
  if (
    /expense|expenses|chi phi|salary|salaries|wages|benefits|training|service|accounting|legal|bank|fee|rent|maintenance|repair|office|utilities|telecommunication|advertising|marketing|hosting|subscription|freight|postage|shipping|travel|tax|insurance|loan|gas|licens/.test(normalized)
  ) {
    return 'expense';
  }
  return null;
}

function isAggregateFinancialRow(label: string): boolean {
  const normalized = normalize(label);
  return /^total\b/.test(normalized)
    || /^tong\b/.test(normalized)
    || /gross profit|loi nhuan gop|profit \/ loss|lai lo/.test(normalized);
}

function buildFinancialBreakdown(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return {
      financialBreakdown: [] as MlCampaignInsights['deepDive']['financialBreakdown'],
      profitabilityByMonth: [] as MlCampaignInsights['deepDive']['profitabilityByMonth'],
    };
  }

  const headers = Object.keys(rows[0]);
  const monthColumns = headers.filter(isMonthColumn);
  if (monthColumns.length < 2) {
    return {
      financialBreakdown: [] as MlCampaignInsights['deepDive']['financialBreakdown'],
      profitabilityByMonth: [] as MlCampaignInsights['deepDive']['profitabilityByMonth'],
    };
  }

  const labelColumn = headers.find(header =>
    rows.some(row => typeof row[header] === 'string' && String(row[header]).trim() !== '')
  );
  if (!labelColumn) {
    return {
      financialBreakdown: [] as MlCampaignInsights['deepDive']['financialBreakdown'],
      profitabilityByMonth: [] as MlCampaignInsights['deepDive']['profitabilityByMonth'],
    };
  }

  const items = rows.flatMap(row => {
    const item = String(row[labelColumn] ?? '').trim();
    const type = financialRowType(item);
    if (!type) return [];
    if (isAggregateFinancialRow(item)) return [];

    const monthly = monthColumns.map(month => ({
      month: monthLabel(month),
      value: parseNumber(row[month]) ?? 0,
    }));
    const total = sum(monthly.map(value => value.value));
    if (total <= 0 && type !== 'profit') return [];

    return [{ type, item, total, monthly }];
  });

  const totalsByType = {
    revenue: sum(items.filter(item => item.type === 'revenue').map(item => item.total)),
    reduction: sum(items.filter(item => item.type === 'reduction').map(item => item.total)),
    expense: sum(items.filter(item => item.type === 'expense').map(item => item.total)),
    profit: sum(items.filter(item => item.type === 'profit').map(item => Math.abs(item.total))),
  };

  const financialBreakdown = items.map(item => ({
    ...item,
    share: safeRatio(Math.abs(item.total), totalsByType[item.type]) ?? 0,
  })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

  const totalRevenueRow = findBestMetricRow(rows, labelColumn, [[/^total revenue$/, /^tong doanh thu$/], [/income from sales/, /^doanh thu$/]]);
  const totalReductionRow = findBestMetricRow(rows, labelColumn, [[/^total reductions$/, /^tong giam tru$/]]);
  const grossProfitRow = findBestMetricRow(rows, labelColumn, [[/gross profit/, /loi nhuan gop/]]);
  const totalExpenseRow = findBestMetricRow(rows, labelColumn, [[/^total expenses$/, /^tong chi phi$/]]);
  const profitRow = findBestMetricRow(rows, labelColumn, [[/profit \/ loss/, /lai lo/, /^profit$/, /^loss$/]]);

  const profitabilityByMonth = monthColumns.map(month => {
    const revenue = parseNumber(totalRevenueRow?.[month]) ?? 0;
    const reductions = parseNumber(totalReductionRow?.[month]) ?? 0;
    const grossProfit = parseNumber(grossProfitRow?.[month]) ?? Math.max(0, revenue - reductions);
    const expenses = parseNumber(totalExpenseRow?.[month]) ?? 0;
    const profit = parseNumber(profitRow?.[month]) ?? grossProfit - expenses;
    return {
      month: monthLabel(month),
      revenue,
      reductions,
      grossProfit,
      expenses,
      profit,
      margin: safeRatio(profit, revenue),
    };
  }).filter(row => row.revenue > 0 || row.expenses > 0 || row.profit !== 0);

  return { financialBreakdown, profitabilityByMonth };
}

function deriveFunnelMetrics(
  detectedSignals: ReturnType<typeof signalRows>,
  totalSpend: number,
  totalActual: number | null,
) {
  const byMetric = Object.fromEntries(detectedSignals.map(signal => [signal.metric, signal]));
  const impressions = byMetric.Impressions?.total ?? null;
  const clicks = byMetric.Clicks?.total ?? null;
  const orders = byMetric.Orders?.total ?? byMetric.Conversions?.total ?? null;

  const derived: Array<{ metric: string; column: string; total: number; average: number }> = [];
  if (impressions && clicks) {
    const ctr = safeRatio(clicks, impressions);
    if (ctr !== null) derived.push({ metric: 'CTR derived', column: 'clicks / impressions', total: ctr, average: ctr });
  }
  if (clicks && totalSpend > 0) {
    const cpc = safeRatio(totalSpend, clicks);
    if (cpc !== null) derived.push({ metric: 'CPC derived', column: 'spend / clicks', total: cpc, average: cpc });
  }
  if (orders && clicks) {
    const cvr = safeRatio(orders, clicks);
    if (cvr !== null) derived.push({ metric: 'CVR derived', column: 'orders / clicks', total: cvr, average: cvr });
  }
  if (orders && totalSpend > 0) {
    const cpa = safeRatio(totalSpend, orders);
    if (cpa !== null) derived.push({ metric: 'CPA derived', column: 'spend / orders', total: cpa, average: cpa });
  }
  if (totalActual !== null && totalSpend > 0) {
    const roas = safeRatio(totalActual, totalSpend);
    if (roas !== null) derived.push({ metric: 'ROAS derived', column: 'sales / spend', total: roas, average: roas });
  }

  return derived;
}

function buildDeepDive(
  mlRows: MlRow[],
  model: MarketingModel,
  channelImpact: Record<FeatureName, 'high' | 'medium' | 'low'>,
  sourceRows: Record<string, unknown>[],
  mapped: MappedColumns,
): MlCampaignInsights['deepDive'] {
  const periodBreakdown: MlCampaignInsights['deepDive']['periodBreakdown'] = mlRows.map(row => {
    const totalSpend = sum(Object.values(row.spendsOriginal));
    const roi = row.actual !== null ? safeRatio(row.actual - totalSpend, totalSpend) : null;
    const predictionErrorPct = row.actual !== null && row.actual > 0
      ? (row.actual - row.predicted) / row.actual
      : null;

    return {
      date: row.date,
      actual: row.actual,
      predicted: Math.round(row.predicted),
      totalSpend,
      roi,
      predictionErrorPct,
    };
  });

  const withActual = periodBreakdown.filter(row => row.actual !== null);
  const totalActual = withActual.length > 0 ? sum(withActual.map(row => row.actual as number)) : null;
  const totalPredicted = sum(periodBreakdown.map(row => row.predicted));
  const totalSpend = sum(periodBreakdown.map(row => row.totalSpend));
  const avgRoi = totalActual !== null ? safeRatio(totalActual - totalSpend, totalSpend) : null;
  const detectedSignals = signalRows(sourceRows, mapped);
  const funnelMetrics = deriveFunnelMetrics(detectedSignals, totalSpend, totalActual);
  const { financialBreakdown, profitabilityByMonth } = buildFinancialBreakdown(sourceRows);
  const avgPredictionErrorPct = withActual.length > 0
    ? sum(withActual.map(row => Math.abs(row.predictionErrorPct ?? 0))) / withActual.length
    : null;

  const bestPeriod = withActual.slice().sort((a, b) => (b.roi ?? -Infinity) - (a.roi ?? -Infinity))[0];
  const weakestPeriod = withActual.slice().sort((a, b) => (a.roi ?? Infinity) - (b.roi ?? Infinity))[0];
  const anomalies = periodBreakdown.filter(row => Math.abs(row.predictionErrorPct ?? 0) >= 0.25);

  periodBreakdown.forEach(row => {
    if (bestPeriod && row.date === bestPeriod.date) row.flag = 'best';
    if (weakestPeriod && row.date === weakestPeriod.date) row.flag = 'weak';
    if ((row.predictionErrorPct ?? 0) >= 0.25) row.flag = 'overperform';
    if ((row.predictionErrorPct ?? 0) <= -0.25) row.flag = 'underperform';
  });

  const channelTotals = model.features.map(feature => ({
    channel: feature,
    totalSpend: sum(mlRows.map(row => row.spendsOriginal[feature] ?? 0)),
  }));
  const channelSpendTotal = sum(channelTotals.map(row => row.totalSpend));
  const channelScores = channelTotals.map(row => {
    const spendShare = safeRatio(row.totalSpend, channelSpendTotal) ?? 0;
    const importanceShare = model.featureImportance[row.channel]?.share ?? 0;
    return {
      ...row,
      spendShare,
      score: importanceShare / Math.max(spendShare, 0.01),
    };
  });
  const maxEfficiency = Math.max(...channelScores.map(row => row.score), 1);

  const channelDiagnostics = channelScores.map(row => {
    const efficiencyIndex = Math.round((row.score / maxEfficiency) * 100);
    let recommendation = 'Giu ngan sach on dinh va theo doi them du lieu.';
    if (efficiencyIndex >= 75 && row.spendShare < 0.35) {
      recommendation = 'Co the tang ngan sach thu nghiem 10-15%.';
    } else if (efficiencyIndex < 35 && row.spendShare > 0.2) {
      recommendation = 'Can giam hoac doi thong diep/targeting.';
    } else if (row.spendShare === 0) {
      recommendation = 'Chua co chi phi trong file upload.';
    }

    return {
      channel: row.channel,
      totalSpend: row.totalSpend,
      spendShare: row.spendShare,
      coefficient: model.coefficients[row.channel] ?? 0,
      impact: channelImpact[row.channel],
      efficiencyIndex,
      recommendation,
    };
  }).sort((a, b) => b.efficiencyIndex - a.efficiencyIndex);

  const monthlyMap = new Map<string, { rows: number; actual: number; actualCount: number; predicted: number; spend: number }>();
  periodBreakdown.forEach(row => {
    const key = monthKey(row.date);
    const current = monthlyMap.get(key) ?? { rows: 0, actual: 0, actualCount: 0, predicted: 0, spend: 0 };
    current.rows += 1;
    current.predicted += row.predicted;
    current.spend += row.totalSpend;
    if (row.actual !== null) {
      current.actual += row.actual;
      current.actualCount += 1;
    }
    monthlyMap.set(key, current);
  });

  const monthlyPivot = Array.from(monthlyMap.entries()).map(([month, value]) => ({
    month,
    rows: value.rows,
    actual: value.actualCount > 0 ? value.actual : null,
    predicted: Math.round(value.predicted),
    spend: value.spend,
    roi: value.actualCount > 0 ? safeRatio(value.actual - value.spend, value.spend) : null,
  }));

  const topChannel = channelDiagnostics[0];
  const weakChannel = channelDiagnostics[channelDiagnostics.length - 1];
  const topExpense = financialBreakdown.find(row => row.type === 'expense');
  const topRevenue = financialBreakdown.find(row => row.type === 'revenue');
  const weakestProfitMonth = profitabilityByMonth.slice().sort((a, b) => a.profit - b.profit)[0];
  const insights = [
    totalActual !== null
      ? `Tong doanh thu thuc te ${Math.round(totalActual).toLocaleString('vi-VN')}, tong chi phi ${Math.round(totalSpend).toLocaleString('vi-VN')}.`
      : `Tong du doan ML ${Math.round(totalPredicted).toLocaleString('vi-VN')}, tong chi phi ${Math.round(totalSpend).toLocaleString('vi-VN')}.`,
    avgRoi !== null
      ? `ROI trung binh ${(avgRoi * 100).toFixed(1)}%.`
      : 'Chua du doanh thu thuc te de tinh ROI.',
    bestPeriod ? `Ky tot nhat: ${bestPeriod.date} voi ROI ${((bestPeriod.roi ?? 0) * 100).toFixed(1)}%.` : '',
    weakestPeriod ? `Ky can xem lai: ${weakestPeriod.date} voi ROI ${((weakestPeriod.roi ?? 0) * 100).toFixed(1)}%.` : '',
    topChannel ? `Kenh hieu qua nhat theo model: ${featureLabel(topChannel.channel)} (index ${topChannel.efficiencyIndex}/100).` : '',
    weakChannel ? `Kenh can kiem tra them: ${featureLabel(weakChannel.channel)} (index ${weakChannel.efficiencyIndex}/100).` : '',
    topRevenue ? `Nguon doanh thu lon nhat: ${topRevenue.item} (${Math.round(topRevenue.total).toLocaleString('vi-VN')}).` : '',
    topExpense ? `Khoan chi lon nhat: ${topExpense.item} (${Math.round(topExpense.total).toLocaleString('vi-VN')}, ${Math.round(topExpense.share * 100)}% nhom chi phi).` : '',
    weakestProfitMonth ? `Thang can theo doi loi nhuan: ${weakestProfitMonth.month} voi profit ${Math.round(weakestProfitMonth.profit).toLocaleString('vi-VN')}.` : '',
    detectedSignals.length > 0
      ? `Da nhan dien them ${detectedSignals.length} cot performance: ${detectedSignals.map(signal => signal.metric).join(', ')}.`
      : 'Chua nhan dien duoc cot funnel nhu impressions/clicks/orders de tinh chi so Power BI nang cao.',
    anomalies.length > 0
      ? `${anomalies.length} dong co sai lech du doan tren 25%, nen doi chieu campaign/event/offline sales.`
      : 'Khong co sai lech du doan lon hon 25%.',
  ].filter(Boolean);

  return {
    summary: {
      rowsAnalyzed: mlRows.length,
      totalActual,
      totalPredicted,
      totalSpend,
      avgRoi,
      avgPredictionErrorPct,
      bestPeriod: bestPeriod?.date,
      weakestPeriod: weakestPeriod?.date,
      anomalyCount: anomalies.length,
    },
    periodBreakdown: periodBreakdown.slice(0, 500),
    channelDiagnostics,
    monthlyPivot,
    chartTemplates: {
      spendByChannel: channelDiagnostics.map(row => ({
        channel: featureLabel(row.channel),
        spend: row.totalSpend,
        share: row.spendShare,
      })),
      monthlyPerformance: monthlyPivot.map(row => ({
        month: row.month,
        actual: row.actual,
        predicted: row.predicted,
        spend: row.spend,
        roi: row.roi,
      })),
      errorTrend: periodBreakdown.map(row => ({
        date: row.date,
        errorPct: row.predictionErrorPct,
      })),
      roiTrend: monthlyPivot.map(row => ({
        month: row.month,
        roi: row.roi,
      })),
      expenseBreakdown: financialBreakdown.filter(row => row.type === 'expense').slice(0, 8).map(row => ({
        item: row.item,
        total: row.total,
        share: row.share,
      })),
      profitTrend: profitabilityByMonth.map(row => ({
        month: row.month,
        revenue: row.revenue,
        expenses: row.expenses,
        profit: row.profit,
        margin: row.margin,
      })),
    },
    financialBreakdown: financialBreakdown.slice(0, 30),
    profitabilityByMonth,
    funnelMetrics,
    detectedSignals,
    insights,
  };
}

function mappedColumnForFeature(mapped: MappedColumns, feature: string): string | undefined {
  return mapped[feature as keyof MappedColumns] as string | undefined;
}

function chooseModelKind(mapped: MappedColumns): keyof typeof MODEL_PATHS {
  if (mapped.instagram || mapped.threads || mapped.tiktok) return 'platform';
  return 'legacy';
}

export function scoreCampaign(rows: Record<string, unknown>[]): MlCampaignInsights {
  const normalizedRows = adaptWideMonthlyFinancialRows(rows);
  const mapped = mapUserColumns(normalizedRows);
  const model = getModel(chooseModelKind(mapped));
  const hasChannelBreakdown = model.features.some(feature => Boolean(mappedColumnForFeature(mapped, feature)));
  const averageSpendTotal = model.features.reduce(
    (sum, feature) => sum + model.featureStatistics[feature].mean,
    0,
  );
  const averageSpendShare: Record<string, number> = Object.fromEntries(
    model.features.map(feature => [
      feature,
      model.featureStatistics[feature].mean / averageSpendTotal,
    ]),
  );

  const spendScaleByFeature: Record<string, number> = Object.fromEntries(
    model.features.map(feature => {
      const column = mappedColumnForFeature(mapped, feature);
      return [
        feature,
        shouldTreatAsVnd(getNumericColumn(normalizedRows, column), column)
          ? model.scaleHints.spendVndPerDatasetUnit
          : 1,
      ];
    }),
  );

  const totalSpendScale = shouldTreatAsVnd(getNumericColumn(normalizedRows, mapped.totalSpend), mapped.totalSpend)
    ? model.scaleHints.spendVndPerDatasetUnit
    : 1;

  const targetScale = shouldTreatAsVnd(getNumericColumn(normalizedRows, mapped.sales), mapped.sales)
    ? model.scaleHints.salesVndPerDatasetUnit
    : 1;

  const mlRows: MlRow[] = normalizedRows.map((row, index) => {
    const spendsOriginal: Record<string, number> = Object.fromEntries(
      model.features.map(feature => {
        const column = mappedColumnForFeature(mapped, feature);
        return [feature, column ? parseNumber(row[column]) ?? 0 : 0];
      }),
    );

    if (!hasChannelBreakdown && mapped.totalSpend) {
      const totalSpend = parseNumber(row[mapped.totalSpend]) ?? 0;
      model.features.forEach(feature => {
        spendsOriginal[feature] = totalSpend * averageSpendShare[feature];
      });
    } else if (mapped.totalSpend) {
      const totalSpend = parseNumber(row[mapped.totalSpend]) ?? 0;
      const mappedSpend = model.features.reduce((sum, feature) => sum + (spendsOriginal[feature] ?? 0), 0);
      const missingFeatures = model.features.filter(feature => !mappedColumnForFeature(mapped, feature));
      const missingShareTotal = missingFeatures.reduce((sum, feature) => sum + averageSpendShare[feature], 0);
      missingFeatures.forEach(feature => {
        spendsOriginal[feature] = Math.max(0, totalSpend - mappedSpend)
          * (averageSpendShare[feature] / (missingShareTotal || 1));
      });
    }

    const spendsDataset: Record<string, number> = Object.fromEntries(
      model.features.map(feature => [
        feature,
        (spendsOriginal[feature] ?? 0) / (mappedColumnForFeature(mapped, feature)
          ? spendScaleByFeature[feature]
          : totalSpendScale),
      ]),
    );

    const predicted = predictDatasetSales(spendsDataset, model) * targetScale;
    const actual = mapped.sales ? parseNumber(row[mapped.sales]) : null;

    return {
      date: mapped.date ? String(row[mapped.date] ?? '') : String(index + 1),
      spendsOriginal,
      spendsDataset,
      actual,
      predicted,
    };
  }).filter(row => Object.values(row.spendsOriginal).some(value => value > 0));

  if (mlRows.length === 0) {
    throw new MlInputError('Không tìm thấy dòng dữ liệu chi phí hợp lệ để chạy ML.');
  }

  const scored = hasChannelBreakdown
    ? scoreCampaignRows(mlRows, model)
    : scoreGenericFinancialRows(mlRows);
  const channelImpact = Object.fromEntries(
    model.features.map(feature => [
      feature,
      classifyImpact(model.featureImportance[feature].share),
    ]),
  ) as Record<FeatureName, 'high' | 'medium' | 'low'>;

  return {
    analysisMode: hasChannelBreakdown ? 'channel' : 'totalSpend',
    modelVersion: model.version,
    modelR2: model.metrics.test.r2,
    userR2: scored.r2,
    mape: scored.mape,
    effectivenessScore: scored.score,
    recommendation: scored.recommendation,
    mappedColumns: mapped,
    channelImpact,
    channelCoefficients: model.coefficients,
    predictedVsActual: mlRows.slice(0, 500).map(row => ({
      date: row.date,
      actual: row.actual,
      predicted: Math.round(row.predicted),
      channels: row.spendsOriginal,
      youtube: row.spendsOriginal.youtube,
      facebook: row.spendsOriginal.facebook,
      newspaper: row.spendsOriginal.newspaper,
      instagram: row.spendsOriginal.instagram,
      threads: row.spendsOriginal.threads,
      tiktok: row.spendsOriginal.tiktok,
    })),
    suggestedBudgetShift: suggestBudgetShift(model),
    deepDive: buildDeepDive(mlRows, model, channelImpact, rows, mapped),
    warning: hasChannelBreakdown
      ? undefined
      : 'File khong co breakdown chi phi theo kenh; he thong dung Tong chi phi lam proxy de cham diem tong quat.',
  };
}

export function buildDetailedMlAnalysisText(ml: MlCampaignInsights): string {
  const summary = ml.deepDive.summary;
  const mapeText = ml.mape === null ? 'N/A' : `${Math.round(ml.mape * 100)}%`;
  const userR2Text = ml.userR2 === null ? 'N/A' : ml.userR2.toFixed(2);
  const actualText = summary.totalActual === null ? 'N/A' : Math.round(summary.totalActual).toLocaleString('vi-VN');
  const roiText = summary.avgRoi === null ? 'N/A' : `${(summary.avgRoi * 100).toFixed(1)}%`;

  const monthlyRows = ml.deepDive.monthlyPivot.slice(0, 8).map(row => {
    const actual = row.actual === null ? 'N/A' : Math.round(row.actual).toLocaleString('vi-VN');
    const roi = row.roi === null ? 'N/A' : `${(row.roi * 100).toFixed(1)}%`;
    return `- ${row.month}: doanh thu ${actual}, chi phi ${Math.round(row.spend).toLocaleString('vi-VN')}, ROI ${roi}.`;
  });

  const channelRows = ml.deepDive.channelDiagnostics.slice(0, 8).map(row =>
    `- ${featureLabel(row.channel)}: chi phi ${Math.round(row.totalSpend).toLocaleString('vi-VN')}, spend share ${(row.spendShare * 100).toFixed(1)}%, efficiency ${row.efficiencyIndex}/100. ${row.recommendation}`,
  );

  const pnlRows = ml.deepDive.profitabilityByMonth.slice(0, 8).map(row =>
    `- ${row.month}: revenue ${Math.round(row.revenue).toLocaleString('vi-VN')}, gross profit ${Math.round(row.grossProfit).toLocaleString('vi-VN')}, expenses ${Math.round(row.expenses).toLocaleString('vi-VN')}, profit ${Math.round(row.profit).toLocaleString('vi-VN')}, margin ${row.margin === null ? 'N/A' : `${(row.margin * 100).toFixed(1)}%`}.`,
  );

  const expenseRows = ml.deepDive.financialBreakdown
    .filter(row => row.type === 'expense')
    .slice(0, 8)
    .map(row => `- ${row.item}: ${Math.round(row.total).toLocaleString('vi-VN')} (${(row.share * 100).toFixed(1)}% trong nhom chi phi).`);

  const signalRowsText = ml.deepDive.detectedSignals.slice(0, 8).map(row =>
    `- ${row.metric}: tong ${Math.round(row.total).toLocaleString('vi-VN')}, trung binh ${Math.round(row.average).toLocaleString('vi-VN')}, trend ${row.trendPct === null ? 'N/A' : `${(row.trendPct * 100).toFixed(1)}%`}.`,
  );

  return [
    `1. Tom tat dieu hanh`,
    `Mode phan tich: ${ml.analysisMode}. Model: ${ml.modelVersion}. Diem hieu qua: ${ml.effectivenessScore}/100, khuyen nghi: ${ml.recommendation}. Tong doanh thu: ${actualText}; tong chi phi: ${Math.round(summary.totalSpend).toLocaleString('vi-VN')}; ROI trung binh: ${roiText}. Model test R2 ${ml.modelR2.toFixed(2)}, R2 tren file ${userR2Text}, MAPE ${mapeText}.`,
    ml.warning ? `Canh bao du lieu: ${ml.warning}` : '',
    '',
    `2. Xu huong theo thoi gian`,
    ...monthlyRows,
    summary.bestPeriod ? `- Ky tot nhat: ${summary.bestPeriod}.` : '',
    summary.weakestPeriod ? `- Ky can uu tien xem lai: ${summary.weakestPeriod}.` : '',
    summary.anomalyCount > 0 ? `- Co ${summary.anomalyCount} dong sai lech du doan lon, nen doi chieu campaign/event/tracking doanh thu.` : '',
    '',
    channelRows.length > 0 ? `3. Hieu qua kenh va ngan sach` : '',
    ...channelRows,
    ml.analysisMode === 'channel' ? `- Goi y ngan sach: ${ml.suggestedBudgetShift}` : '- File chua co breakdown theo kenh, nen chua ket luan duoc ROI rieng tung kenh.',
    '',
    pnlRows.length > 0 ? `4. Phan tich P&L theo thang` : '',
    ...pnlRows,
    '',
    expenseRows.length > 0 ? `5. Cau truc chi phi` : '',
    ...expenseRows,
    '',
    signalRowsText.length > 0 ? `6. Funnel va signal bo sung` : '',
    ...signalRowsText,
    '',
    `7. Ket luan va hanh dong de xuat`,
    ...ml.deepDive.insights.map(item => `- ${item}`),
    `- Neu muc tieu la toi uu marketing, lan upload tiep theo nen co cac cot campaign/platform, spend, impressions, clicks, conversions/orders va revenue de dashboard Power BI-style drilldown sau hon.`,
  ].filter(Boolean).join('\n');
}

export function buildMlAnalysisText(ml: MlCampaignInsights): string {
  const mapeText = ml.mape === null ? 'chưa có đủ actual để tính MAPE' : `${Math.round(ml.mape * 100)}%`;
  const userR2Text = ml.userR2 === null ? 'không đủ dữ liệu để tính R² riêng' : ml.userR2.toFixed(2);

  if (ml.analysisMode === 'totalSpend') {
    return [
      `Phan tich tong chi phi dua tren file upload.`,
      `Diem hieu qua: ${ml.effectivenessScore}/100. Khuyen nghi: ${ml.recommendation}.`,
      ...ml.deepDive.insights,
      `File khong co breakdown chi phi theo kenh, nen he thong khong hien thi tac dong YouTube/Facebook/Newspaper.`,
      ml.warning ?? '',
    ].filter(Boolean).join('\n');
  }

  return [
    `ML baseline ${ml.modelVersion} dự đoán doanh thu từ chi phí YouTube, Facebook và Báo/Newspaper.`,
    `Điểm hiệu quả: ${ml.effectivenessScore}/100. Khuyến nghị: ${ml.recommendation}.`,
    `Model test R²: ${ml.modelR2.toFixed(2)}. Trên file upload: MAPE ${mapeText}, R² ${userR2Text}.`,
    `Tác động kênh: YouTube ${ml.channelImpact.youtube}, Facebook ${ml.channelImpact.facebook}, Báo/Newspaper ${ml.channelImpact.newspaper}.`,
    `Gợi ý ngân sách: ${ml.suggestedBudgetShift}`,
  ].join('\n');
}

export function extractPlatformTrainingRows(rows: Record<string, unknown>[]): PlatformTrainingRow[] {
  const normalizedRows = adaptWideMonthlyFinancialRows(rows);
  const mapped = mapUserColumns(normalizedRows);

  if (!mapped.facebook || !mapped.instagram || !mapped.threads || !mapped.tiktok || !mapped.sales) {
    return [];
  }

  return normalizedRows.map(row => {
    const facebook = parseNumber(row[mapped.facebook as string]);
    const instagram = parseNumber(row[mapped.instagram as string]);
    const threads = parseNumber(row[mapped.threads as string]);
    const tiktok = parseNumber(row[mapped.tiktok as string]);
    const sales = parseNumber(row[mapped.sales as string]);

    if (
      facebook === null || instagram === null || threads === null || tiktok === null || sales === null ||
      facebook < 0 || instagram < 0 || threads < 0 || tiktok < 0 || sales <= 0
    ) {
      return null;
    }

    return { facebook, instagram, threads, tiktok, sales };
  }).filter((row): row is PlatformTrainingRow => row !== null);
}
