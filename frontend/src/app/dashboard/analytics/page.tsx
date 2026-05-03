"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  FileText, CalendarCheck, Send, PenLine,
  ThumbsUp, MessageCircle, MousePointerClick, Eye,
  RefreshCw, TrendingUp,
} from "lucide-react";
import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Overview {
  content: { total: number; draft: number; scheduled: number; published: number };
  byPlatform: { platform: string; count: number }[];
  schedules: { pending: number; published: number; failed: number };
  engagement: {
    totalLikes: number;
    totalComments: number;
    totalClicks: number;
    totalImpressions: number;
    avgScore: number | null;
    trackedPosts: number;
  };
  contentOverTime: { date: string; count: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  tiktok: "#010101",
  instagram: "#E1306C",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  twitter: "#1DA1F2",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color, bg,
}: {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/analytics/overview");
      setData(res.data.data);
    } catch {
      setError("Không thể tải dữ liệu analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1 flex items-center gap-2">
            <TrendingUp className="text-[#E8734A]" /> Analytics
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Tổng quan hiệu quả nội dung và lịch đăng bài của bạn.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 hover:text-[#E8734A] hover:border-[#E8734A]/40 transition disabled:opacity-40"
        >
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
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Tổng bài viết" value={data.content.total} sub="đã tạo"
              icon={FileText} color="text-blue-500" bg="bg-blue-500/10"
            />
            <StatCard
              label="Đã đăng" value={data.content.published} sub="bài published"
              icon={Send} color="text-emerald-500" bg="bg-emerald-500/10"
            />
            <StatCard
              label="Đang lên lịch" value={data.content.scheduled} sub="chờ đăng"
              icon={CalendarCheck} color="text-amber-500" bg="bg-amber-500/10"
            />
            <StatCard
              label="Nháp" value={data.content.draft} sub="chưa lên lịch"
              icon={PenLine} color="text-purple-500" bg="bg-purple-500/10"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Content over time */}
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">
                Nội dung tạo trong 30 ngày qua
              </h3>
              {data.contentOverTime.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                  Chưa có dữ liệu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.contentOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={fmtDate}
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={24} />
                    <Tooltip
                      labelFormatter={(v) => fmtDate(String(v))}
                      formatter={(v) => [v, "Bài viết"]}
                    />
                    <Line
                      type="monotone" dataKey="count"
                      stroke="#E8734A" strokeWidth={2.5}
                      dot={false} activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Posts by platform */}
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">
                Phân bố theo nền tảng
              </h3>
              {data.byPlatform.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                  Chưa có dữ liệu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.byPlatform} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={24} />
                    <Tooltip formatter={(v) => [v, "Bài viết"]} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {data.byPlatform.map((entry) => (
                        <Cell
                          key={entry.platform}
                          fill={PLATFORM_COLORS[entry.platform] ?? "#E8734A"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bottom row: schedule status + engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Schedule status */}
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">
                Trạng thái lịch đăng
              </h3>
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
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Engagement */}
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Tương tác (Engagement)
                </h3>
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
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Đăng bài → Nhập chỉ số thực → AI học → Gợi ý giờ vàng
                    </p>
                  </div>
                  <a
                    href="/dashboard/schedule"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E8734A] text-white text-xs font-bold hover:opacity-90 transition"
                  >
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
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                          {item.value.toLocaleString("vi-VN")}
                        </p>
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
