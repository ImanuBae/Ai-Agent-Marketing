"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  FileText, CalendarCheck, Send, PenLine,
  ThumbsUp, MessageCircle, MousePointerClick, Eye,
  RefreshCw, TrendingUp, Upload, Download, ChevronRight,
  CheckCircle, AlertTriangle, XCircle, BarChart2,
} from "lucide-react";
import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Overview {
  content: { total: number; draft: number; scheduled: number; published: number };
  byPlatform: { platform: string; count: number }[];
  schedules: { pending: number; published: number; failed: number };
  engagement: {
    totalLikes: number; totalComments: number; totalClicks: number;
    totalImpressions: number; avgScore: number | null; trackedPosts: number;
  };
  contentOverTime: { date: string; count: number }[];
}

interface SalesReport {
  id: string;
  fileName: string;
  createdAt: string;
  rowCount: number;
  latestAnalysis: {
    id: string;
    recommendation: string;
    effectivenessScore: number;
    createdAt: string;
  } | null;
}

interface CampaignAnalysis {
  id: string;
  salesReportId: string;
  analysisText: string;
  recommendation: "continue" | "pivot" | "stop";
  effectivenessScore: number;
  rowsAnalyzed: number;
  createdAt: string;
  revenueLabel: string;
  activityLabel: string;
  chartData: { date: string; revenue: number; activity: number }[];
  ml?: {
    analysisMode: "channel" | "totalSpend";
    modelVersion: string;
    modelR2: number;
    userR2: number | null;
    mape: number | null;
    channelImpact: Record<string, string>;
    suggestedBudgetShift: string;
    predictedVsActual: {
      date: string;
      actual: number | null;
      predicted: number;
      channels: Record<string, number>;
    }[];
    deepDive?: {
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
      channelDiagnostics: {
        channel: string;
        totalSpend: number;
        spendShare: number;
        coefficient: number;
        impact: string;
        efficiencyIndex: number;
        recommendation: string;
      }[];
      monthlyPivot: {
        month: string;
        rows: number;
        actual: number | null;
        predicted: number;
        spend: number;
        roi: number | null;
      }[];
      chartTemplates: {
        spendByChannel: { channel: string; spend: number; share: number }[];
        monthlyPerformance: { month: string; actual: number | null; predicted: number; spend: number; roi: number | null }[];
        errorTrend: { date: string; errorPct: number | null }[];
        roiTrend: { month: string; roi: number | null }[];
        expenseBreakdown: { item: string; total: number; share: number }[];
        profitTrend: { month: string; revenue: number; expenses: number; profit: number; margin: number | null }[];
      };
      financialBreakdown: {
        type: "revenue" | "reduction" | "expense" | "profit";
        item: string;
        total: number;
        share: number;
        monthly: { month: string; value: number }[];
      }[];
      profitabilityByMonth: {
        month: string;
        revenue: number;
        reductions: number;
        grossProfit: number;
        expenses: number;
        profit: number;
        margin: number | null;
      }[];
      funnelMetrics: {
        metric: string;
        column: string;
        total: number;
        average: number;
      }[];
      detectedSignals: {
        metric: string;
        column: string;
        total: number;
        average: number;
        trendPct: number | null;
      }[];
      insights: string[];
    };
    warning?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2", tiktok: "#010101", instagram: "#E1306C",
  linkedin: "#0A66C2", youtube: "#FF0000", twitter: "#1DA1F2",
  threads: "#64748B", newspaper: "#F59E0B",
};

const CHART_COLORS = ["#0F766E", "#14B8A6", "#F59E0B", "#E8734A", "#1877F2", "#64748B"];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function fmtVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function fmtPct(n: number | null | undefined) {
  return n === null || n === undefined ? "N/A" : `${(n * 100).toFixed(1)}%`;
}

function fmtMetric(label: string, value: number) {
  if (/ctr|cvr|roi|error/i.test(label)) return fmtPct(value);
  if (/cpc|cpm|cpa|spend|cost|chi/i.test(label)) return fmtVND(value);
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color, bg }: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 flex items-center gap-5 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

function RecommendationBadge({ rec, score }: { rec: string; score: number }) {
  const cfg = {
    continue: { label: "Tiếp tục chiến lược", icon: CheckCircle, bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-200 dark:border-emerald-500/20" },
    pivot:    { label: "Cần điều chỉnh", icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600", border: "border-amber-200 dark:border-amber-500/20" },
    stop:     { label: "Nên dừng lại", icon: XCircle, bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600", border: "border-red-200 dark:border-red-500/20" },
  }[rec] ?? { label: "Đang đánh giá", icon: AlertTriangle, bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };

  const { icon: Icon } = cfg;

  return (
    <div className={`flex items-center gap-4 p-5 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
      <Icon size={32} className={cfg.text} />
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Khuyến nghị</p>
        <p className={`text-lg font-black ${cfg.text}`}>{cfg.label}</p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Điểm hiệu quả</p>
        <p className={`text-3xl font-black ${cfg.text}`}>{score}<span className="text-base font-semibold">/100</span></p>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get("/analytics/overview");
      setData(res.data.data);
    } catch {
      setError("Không thể tải dữ liệu analytics");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={fetchData} disabled={loading}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 hover:text-[#E8734A] hover:border-[#E8734A]/40 transition disabled:opacity-40">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl px-5 py-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center py-32">
          <RefreshCw size={28} className="animate-spin text-[#E8734A]" />
        </div>
      ) : data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Tổng bài viết" value={data.content.total} sub="đã tạo" icon={FileText} color="text-blue-500" bg="bg-blue-500/10" />
            <StatCard label="Đã đăng" value={data.content.published} sub="bài published" icon={Send} color="text-emerald-500" bg="bg-emerald-500/10" />
            <StatCard label="Đang lên lịch" value={data.content.scheduled} sub="chờ đăng" icon={CalendarCheck} color="text-amber-500" bg="bg-amber-500/10" />
            <StatCard label="Nháp" value={data.content.draft} sub="chưa lên lịch" icon={PenLine} color="text-purple-500" bg="bg-purple-500/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">Nội dung tạo trong 30 ngày qua</h3>
              {data.contentOverTime.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm text-gray-400">Chưa có dữ liệu</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.contentOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={24} />
                    <Tooltip labelFormatter={(v) => fmtDate(String(v))} formatter={(v) => [v, "Bài viết"]} />
                    <Line type="monotone" dataKey="count" stroke="#E8734A" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">Phân bố theo nền tảng</h3>
              {data.byPlatform.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm text-gray-400">Chưa có dữ liệu</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.byPlatform} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={24} />
                    <Tooltip formatter={(v) => [v, "Bài viết"]} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {data.byPlatform.map((entry) => (
                        <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] ?? "#E8734A"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">Trạng thái lịch đăng</h3>
              <div className="space-y-3">
                {[
                  { label: "Chờ đăng", value: data.schedules.pending, color: "bg-amber-400", textColor: "text-amber-600" },
                  { label: "Đã đăng", value: data.schedules.published, color: "bg-emerald-400", textColor: "text-emerald-600" },
                  { label: "Thất bại", value: data.schedules.failed, color: "bg-red-400", textColor: "text-red-500" },
                ].map((item) => {
                  const total = data.schedules.pending + data.schedules.published + data.schedules.failed || 1;
                  const pct = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                        <span className={`font-bold ${item.textColor}`}>{item.value}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${item.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Tương tác (Engagement)</h3>
                {data.engagement.avgScore !== null && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8734A]/10 text-[#E8734A]">
                    Avg score: {data.engagement.avgScore}
                  </span>
                )}
              </div>
              {data.engagement.trackedPosts === 0 ? (
                <div className="flex flex-col items-center text-center py-4 gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8734A]/10 flex items-center justify-center">
                    <TrendingUp size={22} className="text-[#E8734A]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">AI chưa có dữ liệu để học</p>
                    <p className="text-xs text-gray-400 leading-relaxed">Đăng bài → Nhập chỉ số thực → AI học → Gợi ý giờ vàng</p>
                  </div>
                  <a href="/dashboard/schedule" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E8734A] text-white text-xs font-bold hover:opacity-90 transition">
                    Đi tới Lịch đăng →
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Lượt thích", value: data.engagement.totalLikes, icon: ThumbsUp, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
                    { label: "Bình luận", value: data.engagement.totalComments, icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { label: "Lượt click", value: data.engagement.totalClicks, icon: MousePointerClick, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
                    { label: "Hiển thị", value: data.engagement.totalImpressions, icon: Eye, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-2xl p-4 flex items-center gap-3 ${item.bg}`}>
                      <item.icon size={18} className={item.color} />
                      <div>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{item.value.toLocaleString("vi-VN")}</p>
                        <p className="text-xs text-gray-500">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Campaign Analysis Tab ────────────────────────────────────────────────────

function CampaignTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analysis, setAnalysis] = useState<CampaignAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [biChannel, setBiChannel] = useState("all");

  const fetchReports = async () => {
    try {
      const res = await api.get("/analytics/sales-reports");
      const list: SalesReport[] = res.data.data;
      setReports(list);
      if (list.length > 0 && !selectedReportId) setSelectedReportId(list[0].id);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/analytics/sales-report", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchReports();
      setSelectedReportId(res.data.data.id);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Không thể upload file");
    } finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedReportId) return;
    setAnalyzing(true); setError(null); setAnalysis(null);
    try {
      const res = await api.post("/analytics/analyze-campaign", {
        salesReportId: selectedReportId,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      });
      setAnalysis(res.data.data);
      setBiChannel("all");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Không thể phân tích. Vui lòng thử lại.");
    } finally { setAnalyzing(false); }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  // Aggregate chart data weekly for readability
  const weeklyChart = (() => {
    if (!analysis?.chartData?.length) return [];
    const weeks: Record<string, { revenue: number; activity: number; week: string }> = {};
    analysis.chartData.forEach((row, i) => {
      const d = new Date(row.date);
      const valid = !isNaN(d.getTime());
      const weekStart = valid ? new Date(d) : new Date(2026, 1, 1 + Math.floor(i / 7) * 7);
      if (valid) weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      if (!weeks[key]) weeks[key] = { revenue: 0, activity: 0, week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}` };
      weeks[key].revenue  += row.revenue;
      weeks[key].activity += row.activity;
    });
    return Object.values(weeks);
  })();

  const biChannels = analysis?.ml?.deepDive?.channelDiagnostics.map(row => row.channel) ?? [];
  const biRows = analysis?.ml?.predictedVsActual.map(row => {
    const spend = biChannel === "all"
      ? Object.values(row.channels).reduce((total, value) => total + value, 0)
      : row.channels[biChannel] ?? 0;
    const roi = row.actual !== null && spend > 0 ? (row.actual - spend) / spend : null;
    const errorPct = row.actual !== null && row.actual > 0 ? (row.actual - row.predicted) / row.actual : null;
    return {
      date: row.date,
      actual: row.actual,
      predicted: row.predicted,
      spend,
      roi,
      errorPct,
    };
  }) ?? [];
  const biActual = biRows.reduce((total, row) => total + (row.actual ?? 0), 0);
  const biSpend = biRows.reduce((total, row) => total + row.spend, 0);
  const biPredicted = biRows.reduce((total, row) => total + row.predicted, 0);
  const biProfit = biActual - biSpend;
  const biRoi = biActual > 0 && biSpend > 0 ? (biActual - biSpend) / biSpend : null;
  const biRoas = biSpend > 0 ? biActual / biSpend : null;
  const biVariance = biActual > 0 ? (biActual - biPredicted) / biActual : null;
  const biStatus = biRoi === null ? "Chua du du lieu" : biRoi >= 0.5 ? "Tot" : biRoi >= 0 ? "Can theo doi" : "Can xu ly";
  const biStatusClass = biRoi === null
    ? "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
    : biRoi >= 0.5
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : biRoi >= 0
        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
        : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
  const biTopPeriods = biRows
    .filter(row => row.actual !== null)
    .slice()
    .sort((a, b) => (b.roi ?? -Infinity) - (a.roi ?? -Infinity))
    .slice(0, 5);
  const biSpendMix = biChannels.map(channel => {
    const spend = analysis?.ml?.predictedVsActual.reduce((total, row) => total + (row.channels[channel] ?? 0), 0) ?? 0;
    return {
      channel,
      spend,
      share: biSpend > 0 ? spend / biSpend : 0,
    };
  }).filter(row => row.spend > 0);
  const biComparison = analysis?.ml?.deepDive?.monthlyPivot.slice(0, 12).map(row => {
    const variance = row.actual !== null && row.actual > 0 ? (row.actual - row.predicted) / row.actual : null;
    return {
      month: row.month,
      actual: row.actual,
      predicted: row.predicted,
      variance,
      status: variance === null ? "Chua co actual" : variance >= 0 ? "Vuot du doan" : "Thap hon du doan",
    };
  }) ?? [];
  const biLargestGap = biComparison
    .filter(row => row.variance !== null)
    .slice()
    .sort((a, b) => Math.abs(b.variance ?? 0) - Math.abs(a.variance ?? 0))[0];
  const showMlForecastComparison = analysis?.ml?.analysisMode === "channel";

  const exportBiCsv = () => {
    if (!biRows.length) return;
    const header = ["date", "actual", "predicted", "spend", "roi", "errorPct"];
    const lines = biRows.map(row => header.map(key => {
      const value = row[key as keyof typeof row];
      return value === null || value === undefined ? "" : String(value);
    }).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-bi-${biChannel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Upload */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#E8734A] text-white text-xs font-black flex items-center justify-center">1</span>
          Upload Dữ liệu Doanh số
        </h3>
        <p className="text-xs text-gray-400 mb-4 ml-8">File Excel hoặc CSV với các cột: Date, Revenue, UnitsSold</p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-[#E8734A] bg-[#E8734A]/5"
              : "border-gray-200 dark:border-white/10 hover:border-[#E8734A]/50 hover:bg-gray-50 dark:hover:bg-white/5"
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-[#E8734A]" />
              <p className="text-sm text-gray-500">Đang upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={24} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Kéo thả hoặc click để chọn file</p>
              <p className="text-xs text-gray-400">.xlsx, .xls, .csv — tối đa 10MB</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <a
            href={`${api.defaults.baseURL}analytics/sample-file`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#E8734A] hover:underline"
          >
            <Download size={13} />
            Tải file mẫu (kem dưỡng da 90 ngày)
          </a>

          <a
            href={`${api.defaults.baseURL}analytics/sample-platform-file`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Download size={13} />
            Tải file mẫu platform
          </a>

          {reports.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Hoặc chọn file đã upload:</span>
              <select
                value={selectedReportId}
                onChange={(e) => { setSelectedReportId(e.target.value); setAnalysis(null); }}
                className="text-xs border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 max-w-[200px] truncate"
              >
                {reports.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.fileName} ({r.rowCount} ngày)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedReport?.latestAnalysis && (
          <div className="mt-3 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl text-xs text-gray-500 flex items-center gap-2">
            <BarChart2 size={13} />
            Phân tích gần nhất: điểm {selectedReport.latestAnalysis.effectivenessScore}/100 —{" "}
            {{ continue: "Tiếp tục", pivot: "Điều chỉnh", stop: "Dừng" }[selectedReport.latestAnalysis.recommendation] ?? selectedReport.latestAnalysis.recommendation}
          </div>
        )}
      </div>

      {/* Step 2: Date range */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#E8734A] text-white text-xs font-black flex items-center justify-center">2</span>
          Khoảng thời gian (tùy chọn)
        </h3>
        <p className="text-xs text-gray-400 mb-4 ml-8">Để trống để phân tích toàn bộ dữ liệu</p>
        <div className="flex gap-4 ml-8">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Từ ngày</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Đến ngày</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300" />
          </div>
        </div>
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!selectedReportId || analyzing}
        className="w-full py-3.5 rounded-2xl bg-[#E8734A] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {analyzing ? (
          <><RefreshCw size={16} className="animate-spin" /> Đang phân tích với AI...</>
        ) : (
          <><TrendingUp size={16} /> Phân tích chiến dịch với AI <ChevronRight size={16} /></>
        )}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl px-5 py-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Recommendation badge */}
          <RecommendationBadge rec={analysis.recommendation} score={analysis.effectivenessScore} />

          {analysis.ml && (
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart2 size={16} className="text-[#E8734A]" /> Dự đoán ML
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8734A]/10 text-[#E8734A]">
                  {analysis.ml.modelVersion}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Model R²</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{analysis.ml.modelR2.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">R² file upload</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white">
                    {analysis.ml.userR2 === null ? "N/A" : analysis.ml.userR2.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">MAPE</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white">
                    {analysis.ml.mape === null ? "N/A" : `${Math.round(analysis.ml.mape * 100)}%`}
                  </p>
                </div>
              </div>

              {analysis.ml.warning && (
                <div className="mb-4 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                  {analysis.ml.warning}
                </div>
              )}

              {analysis.ml.analysisMode === "channel" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Tác động kênh</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analysis.ml.channelImpact).map(([channel, impact]) => (
                        <span key={channel} className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-700 dark:text-gray-300">
                          {channel}: {impact}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Gợi ý ngân sách</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.ml.suggestedBudgetShift}</p>
                  </div>
                </div>
              ) : (<>
                {analysis.ml.deepDive && analysis.ml.deepDive.chartTemplates.expenseBreakdown.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Top chi phi</p>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={analysis.ml.deepDive.chartTemplates.expenseBreakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tickFormatter={(v) => fmtVND(Number(v))} tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="item" tick={{ fontSize: 10 }} width={120} />
                        <Tooltip formatter={(v) => [fmtVND(Number(v)), "Chi phi"]} />
                        <Bar dataKey="total" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {analysis.ml.deepDive && analysis.ml.deepDive.chartTemplates.profitTrend.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Loi nhuan theo thang</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={analysis.ml.deepDive.chartTemplates.profitTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => fmtVND(Number(v))} tick={{ fontSize: 10 }} width={44} />
                        <Tooltip formatter={(v) => [fmtVND(Number(v)), ""]} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#1877F2" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="expenses" name="Chi phi" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="profit" name="Loi nhuan" stroke="#10B981" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Phân tích tổng chi phí</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    File này được chấm theo quan hệ doanh thu và tổng chi phí. Hệ thống sẽ không hiển thị tác động từng kênh khi thiếu dữ liệu Facebook, Instagram, Threads hoặc TikTok.
                  </p>
                </div>
              </>)}
            </div>
          )}

          {analysis.ml?.deepDive && (
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#E8734A]" /> Phân tích chuyên sâu
                </h3>
                <span className="text-xs text-gray-400">{analysis.ml.deepDive.summary.rowsAnalyzed} dòng</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Tổng doanh thu", value: analysis.ml.deepDive.summary.totalActual === null ? "N/A" : fmtVND(analysis.ml.deepDive.summary.totalActual) },
                  { label: "Tổng chi phí", value: fmtVND(analysis.ml.deepDive.summary.totalSpend) },
                  { label: "ROI trung bình", value: fmtPct(analysis.ml.deepDive.summary.avgRoi) },
                  { label: "Sai lệch dự đoán", value: fmtPct(analysis.ml.deepDive.summary.avgPredictionErrorPct) },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-1">{item.label}</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Insight tự động</p>
                  <div className="space-y-2">
                    {analysis.ml.deepDive.insights.map((item) => (
                      <p key={item} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item}</p>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4 overflow-x-auto">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Pivot theo tháng</p>
                  <table className="w-full min-w-[520px] text-xs">
                    <thead className="text-gray-400">
                      <tr className="border-b border-gray-100 dark:border-white/5">
                        <th className="py-2 text-left">Tháng</th>
                        <th className="py-2 text-right">Doanh thu</th>
                        <th className="py-2 text-right">Dự đoán</th>
                        <th className="py-2 text-right">Chi phí</th>
                        <th className="py-2 text-right">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.ml.deepDive.monthlyPivot.slice(0, 8).map((row) => (
                        <tr key={row.month} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                          <td className="py-2 font-semibold text-gray-700 dark:text-gray-300">{row.month}</td>
                          <td className="py-2 text-right text-gray-600 dark:text-gray-400">{row.actual === null ? "N/A" : fmtVND(row.actual)}</td>
                          <td className="py-2 text-right text-gray-600 dark:text-gray-400">{fmtVND(row.predicted)}</td>
                          <td className="py-2 text-right text-gray-600 dark:text-gray-400">{fmtVND(row.spend)}</td>
                          <td className="py-2 text-right font-bold text-gray-800 dark:text-gray-200">{fmtPct(row.roi)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {analysis.ml.analysisMode === "channel" && analysis.ml.deepDive.channelDiagnostics.length > 0 && (
                <div className="mt-5 rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Hiệu quả từng kênh</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {analysis.ml.deepDive.channelDiagnostics.map((row) => (
                      <div key={row.channel} className="rounded-xl bg-gray-50 dark:bg-white/5 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-black text-gray-900 dark:text-white capitalize">{row.channel}</p>
                          <span className="text-xs font-bold text-[#E8734A]">{row.efficiencyIndex}/100</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Spend share: {fmtPct(row.spendShare)}</p>
                        <p className="text-xs text-gray-500 mb-3">Chi phí: {fmtVND(row.totalSpend)}</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{row.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {analysis.ml?.deepDive && (
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart2 size={16} className="text-[#E8734A]" /> Dashboard kiểu Power BI
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${biStatusClass}`}>
                  {biStatus}
                </span>
              </div>

              <div className="mb-5 flex flex-col gap-4">
                <div className="rounded-2xl border border-[#E8734A]/20 bg-[#E8734A]/5 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-black text-gray-900 dark:text-white mb-1">Cach doc nhanh dashboard</p>
                  <p>
                    Chon mot kenh ben duoi de loc rieng chi phi va ROI cua kenh do. Neu xem "Tat ca kenh",
                    dashboard tong hop toan bo ngan sach. Uu tien doc theo thu tu: KPI tong quan, co cau chi phi,
                    so sanh thuc te voi du doan ML, sau do xem bang cac ky hieu qua nhat.
                  </p>
                </div>

                {!showMlForecastComparison && (
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-black mb-1">Luu y ve du doan ML</p>
                    <p>
                      File nay dang o che do tong chi phi, khong co breakdown chi phi theo kenh/campaign. Vi vay ML baseline
                      chi duoc dung nhu diem tham chieu tong quat, khong nen doc nhu mot du bao doanh thu chinh xac. Voi loai
                      file nay, nen uu tien xem doanh thu, chi phi, loi nhuan, ROI va P&L.
                    </p>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setBiChannel("all")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        biChannel === "all"
                          ? "bg-[#E8734A] text-white border-[#E8734A]"
                          : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10"
                      }`}
                    >
                      Tat ca kenh
                    </button>
                    {biChannels.map((channel) => (
                      <button
                        type="button"
                        key={channel}
                        onClick={() => setBiChannel(channel)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border capitalize transition ${
                          biChannel === channel
                            ? "bg-[#E8734A] text-white border-[#E8734A]"
                            : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={exportBiCsv}
                    disabled={biRows.length === 0}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-[#E8734A] hover:border-[#E8734A]/40 disabled:opacity-40"
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    { label: "Doanh thu thuc te", value: fmtVND(biActual), sub: showMlForecastComparison ? `Tong ket qua da ghi nhan. Lech voi ML: ${fmtPct(biVariance)}` : "Tong doanh thu/ket qua thuc te trong file." },
                    showMlForecastComparison
                      ? { label: "Du doan ML", value: fmtVND(biPredicted), sub: `Muc doanh thu model uoc tinh tu chi phi marketing.` }
                      : { label: "Loi nhuan uoc tinh", value: fmtVND(biProfit), sub: "Doanh thu tru tong chi phi trong file." },
                    { label: "Tong chi phi", value: fmtVND(biSpend), sub: biChannel === "all" ? "Chi phi cua tat ca kenh dang co trong file." : `Chi phi rieng cua kenh ${biChannel}.` },
                    { label: "ROI / ROAS", value: fmtPct(biRoi), sub: `ROI = loi nhuan/chi phi. ROAS = ${biRoas === null ? "N/A" : `${biRoas.toFixed(2)}x doanh thu tren 1 dong chi phi`}` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-white/5">
                      <p className="text-xs font-semibold text-gray-500 mb-1">{item.label}</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white">{item.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
                    </div>
                  ))}
                </div>

                {biRows.length > 0 && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {biSpendMix.length > 0 && (
                      <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                        <div className="mb-3">
                          <p className="text-sm font-black text-gray-900 dark:text-white">Co cau chi phi theo kenh</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Dung de tra loi cau hoi: ngan sach dang do vao kenh nao nhieu nhat? Mieng cang lon nghia la kenh do chiem ty trong chi phi cang cao. Neu mot kenh chiem ty trong lon nhung ROI thap, can xem lai cach phan bo ngan sach.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-center">
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie
                                data={biSpendMix}
                                dataKey="spend"
                                nameKey="channel"
                                innerRadius={58}
                                outerRadius={88}
                                paddingAngle={2}
                              >
                                {biSpendMix.map((row, index) => (
                                  <Cell key={row.channel} fill={PLATFORM_COLORS[row.channel] ?? CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => [fmtVND(Number(v)), "Chi phi"]} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="space-y-2">
                            {biSpendMix.map((row, index) => (
                              <div key={row.channel} className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: PLATFORM_COLORS[row.channel] ?? CHART_COLORS[index % CHART_COLORS.length] }}
                                  />
                                  <span className="font-bold text-gray-700 dark:text-gray-300 capitalize truncate">{row.channel}</span>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-gray-900 dark:text-white">{fmtPct(row.share)}</p>
                                  <p className="text-gray-400">{fmtVND(row.spend)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {showMlForecastComparison && biComparison.length > 0 && (
                      <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                        <div className="mb-3">
                          <p className="text-sm font-black text-gray-900 dark:text-white">So sanh doanh thu thuc te voi du doan ML</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {biLargestGap
                              ? `Cot xanh dam la doanh thu thuc te, cot xanh nhat la du doan ML. Lech lon nhat o ${biLargestGap.month}: ${fmtPct(biLargestGap.variance)}. Gia tri duong nghia la thuc te cao hon du doan; gia tri am nghia la thuc te thap hon du doan.`
                              : "Cot xanh dam la doanh thu thuc te, cot xanh nhat la du doan ML. Bieu do nay giup kiem tra model dang du doan cao hay thap hon thuc te."}
                          </p>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={biComparison}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis tickFormatter={(v) => fmtVND(Number(v))} tick={{ fontSize: 10 }} width={44} />
                            <Tooltip formatter={(v) => [fmtVND(Number(v)), ""]} />
                            <Legend />
                            <Bar dataKey="actual" name="Doanh thu thuc te" fill="#0F766E" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="predicted" name="ML du doan" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                      <div className="mb-3">
                        <p className="text-sm font-black text-gray-900 dark:text-white">Doanh thu thuc te so voi du doan va chi phi</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {showMlForecastComparison
                            ? "Dung de xem xu huong theo tung ngay/ky. Duong cam la doanh thu thuc te, xanh duong la doanh thu ML du doan, xanh la la chi phi. Khi duong chi phi tang nhung doanh thu cam khong tang tuong ung, chien dich co dau hieu kem hieu qua."
                            : "Dung de xem xu huong theo tung ngay/ky. Duong cam la doanh thu thuc te, xanh la la chi phi. Voi file tong chi phi, he thong khong ve duong du doan ML trong bieu do nay de tranh hieu nham ve do chinh xac."}
                        </p>
                      </div>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={biRows.slice(0, 120)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis tickFormatter={(v) => fmtVND(Number(v))} tick={{ fontSize: 10 }} width={44} />
                          <Tooltip formatter={(v) => [fmtVND(Number(v)), ""]} />
                          <Legend />
                          <Line type="monotone" dataKey="actual" name="Doanh thu thuc te" stroke="#E8734A" strokeWidth={2.5} dot={false} />
                          {showMlForecastComparison && (
                            <Line type="monotone" dataKey="predicted" name="ML du doan" stroke="#1877F2" strokeWidth={2.5} dot={false} />
                          )}
                          <Line type="monotone" dataKey="spend" name="Chi phi" stroke="#10B981" strokeWidth={2.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4 overflow-x-auto">
                      <div className="mb-3">
                        <p className="text-sm font-black text-gray-900 dark:text-white">Top ky hieu qua nhat</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Bang nay sap xep cac ky theo ROI. "Tot" nghia la doanh thu vuot chi phi ro rang, "Theo doi" nghia la co lai nhung chua manh, "Lo" nghia la chi phi cao hon doanh thu trong ky do.
                        </p>
                      </div>
                      <table className="w-full min-w-[520px] text-xs">
                        <thead className="text-gray-400">
                          <tr className="border-b border-gray-100 dark:border-white/5">
                            <th className="py-2 text-left">Ky</th>
                            <th className="py-2 text-right">Doanh thu</th>
                            <th className="py-2 text-right">Chi phi</th>
                            <th className="py-2 text-right">ROI</th>
                            <th className="py-2 text-right">Nhan xet</th>
                          </tr>
                        </thead>
                        <tbody>
                          {biTopPeriods.map((row) => (
                            <tr key={`${row.date}-${row.spend}`} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                              <td className="py-2 font-semibold text-gray-700 dark:text-gray-300">{row.date}</td>
                              <td className="py-2 text-right text-gray-600 dark:text-gray-400">{row.actual === null ? "N/A" : fmtVND(row.actual)}</td>
                              <td className="py-2 text-right text-gray-600 dark:text-gray-400">{fmtVND(row.spend)}</td>
                              <td className="py-2 text-right font-bold text-gray-800 dark:text-gray-200">{fmtPct(row.roi)}</td>
                              <td className={`py-2 text-right font-bold ${(row.roi ?? 0) >= 0.5 ? "text-emerald-600" : (row.roi ?? 0) >= 0 ? "text-amber-600" : "text-red-500"}`}>
                                {(row.roi ?? -1) >= 0.5 ? "Tot" : (row.roi ?? -1) >= 0 ? "Theo doi" : "Lo"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {analysis.ml.deepDive.profitabilityByMonth.length > 0 && (
                <div className="mb-5 rounded-2xl border border-gray-100 dark:border-white/5 p-4 overflow-x-auto">
                  <p className="text-xs font-semibold text-gray-500 mb-3">P&L theo thang</p>
                  <table className="w-full min-w-[680px] text-xs">
                    <thead className="text-gray-400">
                      <tr className="border-b border-gray-100 dark:border-white/5">
                        <th className="py-2 text-left">Thang</th>
                        <th className="py-2 text-right">Doanh thu</th>
                        <th className="py-2 text-right">Giam tru</th>
                        <th className="py-2 text-right">Loi nhuan gop</th>
                        <th className="py-2 text-right">Chi phi</th>
                        <th className="py-2 text-right">Loi nhuan</th>
                        <th className="py-2 text-right">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.ml.deepDive.profitabilityByMonth.slice(0, 12).map((row) => (
                        <tr key={row.month} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                          <td className="py-2 font-semibold text-gray-700 dark:text-gray-300">{row.month}</td>
                          <td className="py-2 text-right text-gray-600 dark:text-gray-400">{fmtVND(row.revenue)}</td>
                          <td className="py-2 text-right text-gray-600 dark:text-gray-400">{fmtVND(row.reductions)}</td>
                          <td className="py-2 text-right text-gray-600 dark:text-gray-400">{fmtVND(row.grossProfit)}</td>
                          <td className="py-2 text-right text-gray-600 dark:text-gray-400">{fmtVND(row.expenses)}</td>
                          <td className={`py-2 text-right font-bold ${row.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmtVND(row.profit)}</td>
                          <td className="py-2 text-right font-bold text-gray-800 dark:text-gray-200">{fmtPct(row.margin)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {analysis.ml.deepDive.financialBreakdown.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
                  <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4 overflow-x-auto">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Top khoan chi</p>
                    <table className="w-full min-w-[420px] text-xs">
                      <tbody>
                        {analysis.ml.deepDive.financialBreakdown.filter((row) => row.type === "expense").slice(0, 8).map((row) => (
                          <tr key={`${row.type}-${row.item}`} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                            <td className="py-2 font-semibold text-gray-700 dark:text-gray-300">{row.item}</td>
                            <td className="py-2 text-right text-gray-600 dark:text-gray-400">{fmtVND(row.total)}</td>
                            <td className="py-2 text-right font-bold text-gray-800 dark:text-gray-200">{fmtPct(row.share)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4 overflow-x-auto">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Nguon doanh thu va giam tru</p>
                    <table className="w-full min-w-[420px] text-xs">
                      <tbody>
                        {analysis.ml.deepDive.financialBreakdown.filter((row) => row.type === "revenue" || row.type === "reduction").slice(0, 8).map((row) => (
                          <tr key={`${row.type}-${row.item}`} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                            <td className="py-2 font-semibold text-gray-700 dark:text-gray-300">{row.item}</td>
                            <td className="py-2 text-right text-gray-600 dark:text-gray-400">{fmtVND(row.total)}</td>
                            <td className={`py-2 text-right font-bold ${row.type === "reduction" ? "text-amber-600" : "text-emerald-600"}`}>{row.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {analysis.ml.deepDive.detectedSignals.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  {analysis.ml.deepDive.detectedSignals.slice(0, 8).map((signal) => (
                    <div key={signal.metric} className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
                      <p className="text-xs font-semibold text-gray-500 mb-1">{signal.metric}</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{fmtMetric(signal.metric, signal.total)}</p>
                      <p className="text-xs text-gray-400 truncate">{signal.column}</p>
                      <p className={`text-xs font-bold mt-2 ${(signal.trendPct ?? 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        Trend: {fmtPct(signal.trendPct)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {analysis.ml.deepDive.funnelMetrics.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                  {analysis.ml.deepDive.funnelMetrics.map((metric) => (
                    <div key={metric.metric} className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                      <p className="text-xs font-semibold text-gray-500 mb-1">{metric.metric}</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{fmtMetric(metric.metric, metric.total)}</p>
                      <p className="text-xs text-gray-400">{metric.column}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Doanh thu - dự đoán - chi phí</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={analysis.ml.deepDive.chartTemplates.monthlyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => fmtVND(Number(v))} tick={{ fontSize: 10 }} width={44} />
                      <Tooltip formatter={(v) => [fmtVND(Number(v)), ""]} />
                      <Legend />
                      <Bar dataKey="actual" name="Actual" fill="#E8734A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="predicted" name="Predicted" fill="#1877F2" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="spend" name="Spend" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Chi phí theo kênh</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={analysis.ml.deepDive.chartTemplates.spendByChannel} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tickFormatter={(v) => fmtVND(Number(v))} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="channel" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip formatter={(v) => [fmtVND(Number(v)), "Spend"]} />
                      <Bar dataKey="spend" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">ROI theo tháng</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={analysis.ml.deepDive.chartTemplates.roiTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => fmtPct(Number(v))} tick={{ fontSize: 10 }} width={44} />
                      <Tooltip formatter={(v) => [fmtPct(Number(v)), "ROI"]} />
                      <Line type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-white/5 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Sai lệch dự đoán</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={analysis.ml.deepDive.chartTemplates.errorTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                      <YAxis tickFormatter={(v) => fmtPct(Number(v))} tick={{ fontSize: 10 }} width={44} />
                      <Tooltip formatter={(v) => [fmtPct(Number(v)), "Error"]} />
                      <Line type="monotone" dataKey="errorPct" stroke="#EF4444" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Revenue + posts chart */}
          {weeklyChart.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">
                Actual vs Predicted theo tuần
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weeklyChart} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="rev" tickFormatter={(v) => fmtVND(v)} tick={{ fontSize: 10 }} width={44} />
                  <YAxis yAxisId="posts" orientation="right" allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
                  <Tooltip
                    formatter={(v, name) =>
                      name === "Doanh thu"
                        ? [Number(v).toLocaleString("vi-VN") + " VND", name]
                        : [v, name]
                    }
                  />
                  <Legend />
                  <Bar yAxisId="rev" dataKey="revenue" name={analysis.revenueLabel} fill="#E8734A" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="posts" dataKey="activity" name={analysis.activityLabel} fill="#1877F2" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* AI analysis report */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={16} className="text-[#E8734A]" /> Báo cáo phân tích AI
              <span className="ml-auto text-xs text-gray-400 font-normal">{analysis.rowsAnalyzed} ngày dữ liệu</span>
            </h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-white/5 rounded-2xl p-5 font-mono text-xs">
              {analysis.analysisText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "overview" | "campaign";

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1 flex items-center gap-2">
          <TrendingUp className="text-[#E8734A]" /> Analytics
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Tổng quan hiệu quả nội dung và phân tích chiến dịch marketing.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
        {([
          { id: "overview" as Tab, label: "Tổng quan", icon: BarChart2 },
          { id: "campaign" as Tab, label: "Phân tích Chiến dịch", icon: TrendingUp },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === id
                ? "bg-white dark:bg-slate-800 text-[#E8734A] shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? <OverviewTab /> : <CampaignTab />}
    </div>
  );
}
