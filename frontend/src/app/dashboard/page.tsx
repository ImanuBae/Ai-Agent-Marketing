"use client";

import { useState, useEffect } from "react";
import {
  FileText, CalendarClock, CheckCircle2, Sparkles,
  History, Clock
} from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";
import StatsCard from "@/components/dashboard/StatsCard";
import TrendChart from "@/components/dashboard/TrendChart";
import { Spinner, EmptyState } from "@/components/ui";

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
        const res = await api.get("/content/history?limit=50&page=1");
        if (res.data.success) {
          const contents: ContentItem[] = res.data.data.contents || [];
          const pagination = res.data.data.pagination;

          const scheduled = contents.filter((c) => c.status === "scheduled").length;
          const published = contents.filter((c) => c.status === "published").length;
          const draft = contents.filter((c) => c.status === "draft").length;

          setStats({ total: pagination?.total ?? contents.length, scheduled, published, draft });
          setActivities(contents.slice(0, 4));

          // Build 7-day bar chart
          const now = new Date();
          const dayCounts = Array(7).fill(0);
          contents.forEach((c) => {
            const created = new Date(c.createdAt);
            const daysAgo = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            if (daysAgo >= 0 && daysAgo < 7) dayCounts[6 - daysAgo] += 1;
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
    { name: "Bài viết đã tạo", value: stats.total.toString(), change: "tổng cộng", trending: "up" as const, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Đang lên lịch", value: stats.scheduled.toString(), change: `${stats.draft} nháp`, trending: "neutral" as const, icon: CalendarClock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Đã xuất bản", value: stats.published.toString(), change: "thành công", trending: "up" as const, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    {
      name: "AI Tokens dùng",
      value: stats.total > 0 ? `~${(stats.total * 850).toLocaleString()}` : "0",
      change: "ước tính",
      trending: "neutral" as const,
      icon: Sparkles,
      color: "text-[#E8734A]",
      bg: "bg-[#E8734A]/10",
    },
  ];

  const getStatusMeta = (status: string) => {
    if (status === "published") return { color: "bg-emerald-500", label: "Đã đăng", textColor: "text-emerald-600" };
    if (status === "scheduled") return { color: "bg-blue-500", label: "Lên lịch", textColor: "text-blue-500" };
    return { color: "bg-amber-500", label: "Nháp", textColor: "text-amber-500" };
  };

  const getPlatformLabel = (platform: string) => {
    const map: Record<string, string> = {
      facebook: "Facebook", tiktok: "TikTok", linkedin: "LinkedIn",
      instagram: "Instagram", twitter: "Twitter/X",
    };
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
        <Spinner size={40} />
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
          <StatsCard key={stat.name} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="col-span-2">
          <TrendChart
            data={chartData}
            title="Bài viết tạo trong 7 ngày"
            emptyMessage="Chưa có nội dung nào."
            emptyAction={
              <Link href="/dashboard/content" className="text-[#E8734A] font-bold hover:underline">
                Tạo bài viết đầu tiên →
              </Link>
            }
          />
          {/* Quick action link */}
          <div className="mt-2 flex justify-end">
            <Link href="/dashboard/content" className="text-[#E8734A] font-bold hover:underline text-xs">
              + Tạo bài mới →
            </Link>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="col-span-1 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <History className="text-blue-500" size={20} /> Hoạt động gần đây
          </h3>

          {activities.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Chưa có hoạt động nào"
              action={
                <Link href="/dashboard/content" className="text-xs font-bold text-[#E8734A] hover:underline">
                  Tạo bài viết đầu tiên →
                </Link>
              }
            />
          ) : (
            <div className="flex-1 overflow-y-auto space-y-5 no-scrollbar pr-1">
              {activities.map((activity) => {
                const meta = getStatusMeta(activity.status);
                return (
                  <div
                    key={activity.id}
                    className="relative pl-6 before:absolute before:left-2 before:top-3 before:bottom-[-24px] before:w-px before:bg-gray-200 dark:before:bg-white/10 last:before:hidden group"
                  >
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${meta.color}`} />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#E8734A] transition-colors line-clamp-2">
                        {activity.caption?.slice(0, 60)}...
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {timeAgo(activity.createdAt)}
                        </span>
                        <span className="opacity-50">•</span>
                        <span>{getPlatformLabel(activity.platform)}</span>
                        <span className="opacity-50">•</span>
                        <span className={`font-bold ${meta.textColor}`}>{meta.label}</span>
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
