"use client";

import { useState, useEffect } from "react";
import { 
  FileText, CalendarClock, CheckCircle2, Sparkles,
  ArrowUpRight, Activity, History, Clock, Loader2
} from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

interface ContentItem {
  id: string;
  caption: string;
  platform: string;
  status: "draft" | "scheduled" | "published";
  createdAt: string;
}

interface DashboardStats {
  total: number;
  scheduled: number;
  published: number;
  draft: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ total: 0, scheduled: 0, published: 0, draft: 0 });
  const [activities, setActivities] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all content (latest 50)
        const res = await api.get("/content/history?limit=50&page=1");
        if (res.data.success) {
          const contents: ContentItem[] = res.data.data.contents || [];
          const pagination = res.data.data.pagination;

          // Compute stats
          const scheduled = contents.filter(c => c.status === "scheduled").length;
          const published = contents.filter(c => c.status === "published").length;
          const draft = contents.filter(c => c.status === "draft").length;

          setStats({
            total: pagination?.total ?? contents.length,
            scheduled,
            published,
            draft,
          });

          // Latest 4 for activity feed
          setActivities(contents.slice(0, 4));

          // Build 7-day bar chart: count items created per day in last 7 days
          const now = new Date();
          const dayCounts = Array(7).fill(0);
          contents.forEach(c => {
            const created = new Date(c.createdAt);
            const daysAgo = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            if (daysAgo >= 0 && daysAgo < 7) {
              dayCounts[6 - daysAgo] += 1;
            }
          });
          setChartData(dayCounts);
        }
      } catch {
        // Keep zero state on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { name: "Bài viết đã tạo", value: stats.total.toString(), change: "tổng cộng", trending: "up", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Đang lên lịch", value: stats.scheduled.toString(), change: `${stats.draft} nháp`, trending: "neutral", icon: CalendarClock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Đã xuất bản", value: stats.published.toString(), change: "thành công", trending: "up", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "AI Tokens dùng", value: stats.total > 0 ? `~${(stats.total * 850).toLocaleString()}` : "0", change: "ước tính", trending: "neutral", icon: Sparkles, color: "text-[#E8734A]", bg: "bg-[#E8734A]/10" },
  ];

  const maxBar = Math.max(...chartData, 1);

  const getStatusMeta = (status: string) => {
    if (status === "published") return { color: "bg-emerald-500", label: "Đã đăng" };
    if (status === "scheduled") return { color: "bg-blue-500", label: "Lên lịch" };
    return { color: "bg-amber-500", label: "Nháp" };
  };

  const getPlatformLabel = (platform: string) => {
    const map: Record<string, string> = { facebook: "Facebook", tiktok: "TikTok", linkedin: "LinkedIn", instagram: "Instagram", twitter: "Twitter/X" };
    return map[platform] || platform;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days} ngày trước`;
    if (hrs > 0) return `${hrs} giờ trước`;
    if (mins > 0) return `${mins} phút trước`;
    return "Vừa xong";
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#E8734A] animate-spin" />
        <p className="text-sm font-bold text-gray-500 animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">

      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
          Tổng quan chiến dịch
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Theo dõi bài viết, trạng thái lên lịch và hoạt động hệ thống của bạn.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stat.name}</p>
              <div className={`p-2.5 rounded-[14px] ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">{stat.value}</h3>
            <div className="flex items-center gap-2 text-xs">
              <div className={`flex items-center gap-1 font-bold px-2 py-1 rounded-full border ${
                stat.trending === "up"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                  : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:border-white/10"
              }`}>
                {stat.trending === "up" && <ArrowUpRight size={12} />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart: 7-day performance */}
        <div className="col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 min-h-[380px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="text-[#E8734A]" size={20} /> Bài viết tạo trong 7 ngày
            </h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8734A]" /> Tạo mới
              </div>
              <Link href="/dashboard/content" className="text-[#E8734A] font-bold hover:underline text-xs">
                + Tạo bài mới →
              </Link>
            </div>
          </div>

          <div className="relative h-56 mt-4">
            <div className="absolute left-0 bottom-5 top-0 w-8 flex flex-col justify-between text-[10px] text-gray-400 font-medium">
              <span>{maxBar}</span>
              <span>{Math.ceil(maxBar * 0.75)}</span>
              <span>{Math.ceil(maxBar * 0.5)}</span>
              <span>{Math.ceil(maxBar * 0.25)}</span>
              <span>0</span>
            </div>
            <div className="absolute inset-0 ml-10 border-l border-b border-gray-100 dark:border-white/5 pb-5">
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map(v => (
                <div key={v} className="absolute w-full border-t border-dashed border-gray-200 dark:border-white/5" style={{ top: `${(1 - v) * 100}%` }} />
              ))}
              {/* Bars */}
              <div className="absolute inset-0 pt-2 flex items-end justify-between px-4 pb-0 gap-2">
                {chartData.map((val, i) => (
                  <div key={i} className="flex flex-col items-center justify-end h-full flex-1 gap-1 group">
                    <div
                      className="w-full bg-[#E8734A] rounded-t-md transition-all duration-700 hover:opacity-80 relative min-h-[4px]"
                      style={{ height: `${(val / maxBar) * 90}%` }}
                    >
                      {val > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg transition-opacity whitespace-nowrap">
                          {val} bài
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-10 right-0 h-5 flex justify-between px-4 text-[10px] text-gray-400 font-medium">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                <span key={day} className="flex-1 text-center">{day}</span>
              ))}
            </div>
          </div>

          {/* Total summary row */}
          {stats.total === 0 && (
            <div className="mt-6 text-center text-sm text-gray-400 font-medium">
              Chưa có nội dung nào. <Link href="/dashboard/content" className="text-[#E8734A] font-bold hover:underline">Tạo bài viết đầu tiên →</Link>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="col-span-1 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <History className="text-blue-500" size={20} /> Hoạt động gần đây
          </h3>

          {activities.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <Sparkles size={22} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium">Chưa có hoạt động nào</p>
              <Link href="/dashboard/content" className="text-xs font-bold text-[#E8734A] hover:underline">
                Tạo bài viết đầu tiên →
              </Link>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-5 no-scrollbar pr-1">
              {activities.map((activity) => {
                const meta = getStatusMeta(activity.status);
                return (
                  <div key={activity.id} className="relative pl-6 before:absolute before:left-2 before:top-3 before:bottom-[-24px] before:w-px before:bg-gray-200 dark:before:bg-white/10 last:before:hidden group">
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${meta.color}`} />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#E8734A] transition-colors line-clamp-2">
                        {activity.caption?.slice(0, 60)}...
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(activity.createdAt)}</span>
                        <span className="opacity-50">•</span>
                        <span>{getPlatformLabel(activity.platform)}</span>
                        <span className="opacity-50">•</span>
                        <span className={`font-bold ${
                          activity.status === "published" ? "text-emerald-600" :
                          activity.status === "scheduled" ? "text-blue-500" : "text-amber-500"
                        }`}>{meta.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            href="/dashboard/content"
            className="w-full mt-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors block text-center"
          >
            Tạo nội dung mới
          </Link>
        </div>
      </div>
    </div>
  );
}
