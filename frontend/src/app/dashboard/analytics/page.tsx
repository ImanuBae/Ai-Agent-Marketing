"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, Cell,
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
  chartData: {
    date: string;
    revenue: number;
    posts: number;
    reach: number;
    engagementRate: number;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2", tiktok: "#010101", instagram: "#E1306C",
  linkedin: "#0A66C2", youtube: "#FF0000", twitter: "#1DA1F2",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function fmtVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(n);
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
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Không thể phân tích. Vui lòng thử lại.");
    } finally { setAnalyzing(false); }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  // Aggregate chart data weekly for readability
  const weeklyChart = (() => {
    if (!analysis?.chartData) return [];
    const weeks: Record<string, { revenue: number; posts: number; week: string }> = {};
    analysis.chartData.forEach(row => {
      const d = new Date(row.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      if (!weeks[key]) weeks[key] = { revenue: 0, posts: 0, week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}` };
      weeks[key].revenue += row.revenue;
      weeks[key].posts += row.posts;
    });
    return Object.values(weeks);
  })();

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

          {/* Revenue + posts chart */}
          {weeklyChart.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">
                Doanh thu theo tuần & Số bài đăng
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
                  <Bar yAxisId="rev" dataKey="revenue" name="Doanh thu" fill="#E8734A" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="posts" dataKey="posts" name="Bài đăng" fill="#1877F2" radius={[4, 4, 0, 0]} barSize={12} />
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
