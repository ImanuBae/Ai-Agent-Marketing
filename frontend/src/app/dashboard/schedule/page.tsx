"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  AlertCircle,
  FileText,
  X,
  Loader2,
  Sparkles,
  BarChart2,
  Edit2,
  Check,
} from "lucide-react";
import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduleItem {
  id: string;
  contentId: string;
  platform: string;
  scheduledAt: string;
  status: "pending" | "published" | "failed";
  isOptimized: boolean;
  confidenceScore: number | null;
  content: {
    caption: string;
    hashtags: string[];
    platform: string;
    status: string;
  };
}

interface ContentItem {
  id: string;
  platform: string;
  caption: string;
  status: string;
}

interface OptimalSlot {
  dayOfWeek: number;
  hourOfDay: number;
  avgScore: number | null;
  sampleCount: number;
}

interface OptimalTimeResult {
  source: "benchmark" | "historical";
  slots: OptimalSlot[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TZ_OFFSET = 7;

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-600",
  tiktok: "bg-slate-900 dark:bg-slate-700",
  linkedin: "bg-sky-600",
  instagram: "bg-pink-600",
  youtube: "bg-red-600",
};

const PLATFORM_TEXT: Record<string, string> = {
  facebook: "text-blue-600",
  tiktok: "text-slate-900 dark:text-white",
  linkedin: "text-sky-600",
  instagram: "text-pink-600",
  youtube: "text-red-600",
};

const PLATFORM_BG: Record<string, string> = {
  facebook: "bg-blue-50 dark:bg-blue-950/30",
  tiktok: "bg-slate-100 dark:bg-slate-800",
  linkedin: "bg-sky-50 dark:bg-sky-950/30",
  instagram: "bg-pink-50 dark:bg-pink-950/30",
  youtube: "bg-red-50 dark:bg-red-950/30",
};

const MONTH_NAMES = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
];

const DAY_VN = ["Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// Get local date components from UTC ISO string (UTC+TZ_OFFSET)
function localDateParts(iso: string) {
  const ms = new Date(iso).getTime() + TZ_OFFSET * 3_600_000;
  const d = new Date(ms);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
  };
}

// Format "HH:MM" in local time
function localTime(iso: string) {
  const d = new Date(iso);
  const h = (d.getUTCHours() + TZ_OFFSET) % 24;
  return `${pad(h)}:${pad(d.getUTCMinutes())}`;
}

// Format relative time label for upcoming sidebar
function relativeTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((d.getTime() - now.getTime()) / 86_400_000);
  const t = localTime(iso);
  if (diffDays === 0) return `Hôm nay, ${t}`;
  if (diffDays === 1) return `Ngày mai, ${t}`;
  return `${DAY_VN[localDateParts(iso).weekday]}, ${t}`;
}

// Format optimal slot time range
function slotTimeRange(slot: OptimalSlot) {
  const h = (slot.hourOfDay + TZ_OFFSET) % 24;
  return `${pad(h)}:00 – ${pad((h + 2) % 24)}:00`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const [fbOptimal, setFbOptimal] = useState<OptimalTimeResult | null>(null);
  const [ttOptimal, setTtOptimal] = useState<OptimalTimeResult | null>(null);

  // Create modal state
  const [showModal, setShowModal] = useState(false);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Engagement modal state
  const [engagementSchedule, setEngagementSchedule] = useState<ScheduleItem | null>(null);
  const [engagementData, setEngagementData] = useState({ likes: "", comments: "", clicks: "", impressions: "" });
  const [engagementSubmitting, setEngagementSubmitting] = useState(false);
  const [engagementDone, setEngagementDone] = useState<Set<string>>(new Set());

  // Reschedule state
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  // ── Fetch schedules for current month ──────────────────────────────────────
  const fetchSchedules = useCallback(async () => {
    setLoadingSchedules(true);
    try {
      const { data } = await api.get("schedule", {
        params: { month: currentMonth, year: currentYear },
      });
      setSchedules(data.data ?? []);
    } catch {
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  }, [currentMonth, currentYear]);

  // ── Fetch AI golden hours (once on mount) ──────────────────────────────────
  const fetchOptimal = useCallback(async () => {
    try {
      const [fbRes, ttRes] = await Promise.all([
        api.get("schedule/optimal-time", {
          params: { platform: "facebook", count: 1, timezoneOffset: TZ_OFFSET },
        }),
        api.get("schedule/optimal-time", {
          params: { platform: "tiktok", count: 1, timezoneOffset: TZ_OFFSET },
        }),
      ]);
      setFbOptimal(fbRes.data.data);
      setTtOptimal(ttRes.data.data);
    } catch {
      // leave null — UI handles missing state
    }
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);
  useEffect(() => { fetchOptimal(); }, [fetchOptimal]);

  // ── Month navigation ────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };
  const goToday = () => {
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
  };

  // ── Calendar grid (Monday-start) ────────────────────────────────────────────
  const rawFirstDay = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0=Sun
  const firstDay = (rawFirstDay + 6) % 7; // 0=Mon
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const calendarCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const eventsForDay = (day: number) =>
    schedules.filter(s => {
      const lc = localDateParts(s.scheduledAt);
      return lc.day === day && lc.month === currentMonth && lc.year === currentYear;
    });

  const upcoming = schedules
    .filter(s => s.status === "pending" && new Date(s.scheduledAt) >= today)
    .slice(0, 3);

  // ── Create schedule ─────────────────────────────────────────────────────────
  const openModal = async () => {
    setShowModal(true);
    setSelectedContentId("");
    setScheduledAt("");
    setContentLoading(true);
    try {
      const { data } = await api.get("content/history", {
        params: { status: "draft", limit: 50 },
      });
      setContents(data.data?.contents ?? []);
    } catch {
      setContents([]);
    } finally {
      setContentLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedContentId) return;
    setSubmitting(true);
    try {
      await api.post("schedule", {
        contentId: selectedContentId,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        timezone: "Asia/Ho_Chi_Minh",
        timezoneOffset: TZ_OFFSET,
      });
      setShowModal(false);
      fetchSchedules();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg ?? "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete schedule ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Hủy lịch đăng bài này?")) return;
    setDeletingId(id);
    try {
      await api.delete(`schedule/${id}`);
      fetchSchedules();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg ?? "Không thể hủy lịch");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Engagement ───────────────────────────────────────────────────────────────
  const engagementScore = () => {
    const l = Number(engagementData.likes) || 0;
    const c = Number(engagementData.comments) || 0;
    const cl = Number(engagementData.clicks) || 0;
    const imp = Number(engagementData.impressions) || 1;
    const ctr = cl / imp;
    return Math.min(100, 0.4 * l + 0.3 * c + 0.2 * cl + 0.1 * ctr * 100).toFixed(1);
  };

  const handleEngagementSubmit = async () => {
    if (!engagementSchedule) return;
    setEngagementSubmitting(true);
    try {
      await api.post("schedule/engagement", {
        contentId: engagementSchedule.contentId,
        likes: Number(engagementData.likes) || 0,
        comments: Number(engagementData.comments) || 0,
        clicks: Number(engagementData.clicks) || 0,
        impressions: Number(engagementData.impressions) || 0,
      });
      setEngagementDone(prev => new Set([...prev, engagementSchedule.id]));
      setEngagementSchedule(null);
      setEngagementData({ likes: "", comments: "", clicks: "", impressions: "" });
    } catch {
      alert("Không thể lưu chỉ số. Vui lòng thử lại.");
    } finally {
      setEngagementSubmitting(false);
    }
  };

  // ── Reschedule ───────────────────────────────────────────────────────────────
  const handleReschedule = async (id: string) => {
    if (!rescheduleAt) return;
    setRescheduling(true);
    try {
      await api.put(`schedule/${id}`, { scheduledAt: new Date(rescheduleAt).toISOString() });
      setRescheduleId(null);
      setRescheduleAt("");
      fetchSchedules();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg ?? "Không thể đổi giờ. Kiểm tra lại thời gian.");
    } finally {
      setRescheduling(false);
    }
  };

  // ── Golden hours data ───────────────────────────────────────────────────────
  const goldenHours = [
    fbOptimal?.slots[0]
      ? { platform: "Facebook", slot: fbOptimal.slots[0], source: fbOptimal.source, key: "facebook" }
      : null,
    ttOptimal?.slots[0]
      ? { platform: "TikTok", slot: ttOptimal.slots[0], source: ttOptimal.source, key: "tiktok" }
      : null,
  ].filter(Boolean) as { platform: string; slot: OptimalSlot; source: string; key: string }[];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 min-h-[calc(100vh-100px)] flex flex-col">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1 flex items-center gap-2">
            <CalendarIcon className="text-[#E8734A]" /> Lên lịch & Đăng bài
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Quản lý chiến dịch nội dung đa kênh trên một giao diện duy nhất.
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-[#E8734A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#E8734A]/20 hover:opacity-90 hover:scale-[0.98] transition-all"
        >
          <Plus size={18} /> Lên lịch bài mới
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

        {/* Calendar (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {MONTH_NAMES[currentMonth - 1]}, {currentYear}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToday}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                Hôm nay
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 flex flex-col p-4 bg-gray-50/30 dark:bg-slate-900/50">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["T2","T3","T4","T5","T6","T7","CN"].map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}
            </div>

            {loadingSchedules ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#E8734A]" size={32} />
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-7 gap-2">
                {calendarCells.map((day, idx) => {
                  const dayEvents = day ? eventsForDay(day) : [];
                  const todayLocal = localDateParts(today.toISOString());
                  const isToday =
                    day === todayLocal.day &&
                    currentMonth === todayLocal.month &&
                    currentYear === todayLocal.year;

                  return (
                    <div
                      key={idx}
                      className={`min-h-[100px] bg-white dark:bg-slate-800 rounded-2xl border transition-colors group ${
                        isToday
                          ? "border-[#E8734A] shadow-sm shadow-[#E8734A]/10"
                          : "border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20"
                      } p-2 flex flex-col`}
                    >
                      {day && (
                        <div className="flex-1 flex flex-col">
                          <span
                            className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1.5 ${
                              isToday
                                ? "bg-[#E8734A] text-white"
                                : "text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                            }`}
                          >
                            {day}
                          </span>
                          <div className="flex flex-col gap-1 overflow-hidden">
                            {dayEvents.map(evt => {
                              const isRescheduling = rescheduleId === evt.id;
                              return (
                                <div key={evt.id} className="flex flex-col gap-0.5">
                                  <div
                                    title={`${evt.content.caption} — ${localTime(evt.scheduledAt)}`}
                                    className={`text-[10px] font-bold px-1.5 py-1 rounded-md text-white truncate cursor-pointer hover:opacity-80 transition flex items-center justify-between gap-1 group/evt ${PLATFORM_COLORS[evt.platform] ?? "bg-gray-500"}`}
                                  >
                                    <span className="truncate">
                                      {localTime(evt.scheduledAt)} {evt.content.caption.slice(0, 12)}
                                      {engagementDone.has(evt.id) && (
                                        <Check size={8} className="inline ml-1 text-green-300" />
                                      )}
                                    </span>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      {evt.status === "pending" && (
                                        <button
                                          onClick={e => { e.stopPropagation(); setRescheduleId(isRescheduling ? null : evt.id); setRescheduleAt(""); }}
                                          className="opacity-0 group-hover/evt:opacity-100 transition"
                                          title="Đổi giờ"
                                        >
                                          <Edit2 size={8} />
                                        </button>
                                      )}
                                      {evt.status === "pending" && (
                                        <button
                                          onClick={e => { e.stopPropagation(); handleDelete(evt.id); }}
                                          className="opacity-0 group-hover/evt:opacity-100 transition"
                                          title="Hủy lịch"
                                        >
                                          {deletingId === evt.id ? <Loader2 size={8} className="animate-spin" /> : <X size={8} />}
                                        </button>
                                      )}
                                      {evt.status === "published" && !engagementDone.has(evt.id) && (
                                        <button
                                          onClick={e => { e.stopPropagation(); setEngagementSchedule(evt); setEngagementData({ likes: "", comments: "", clicks: "", impressions: "" }); }}
                                          className="opacity-0 group-hover/evt:opacity-100 transition"
                                          title="Nhập chỉ số"
                                        >
                                          <BarChart2 size={8} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {/* Reschedule inline popover */}
                                  {isRescheduling && (
                                    <div className="bg-white dark:bg-slate-800 border border-[#E8734A]/30 rounded-xl p-2 shadow-lg flex flex-col gap-1">
                                      <input
                                        type="datetime-local"
                                        value={rescheduleAt}
                                        onChange={e => setRescheduleAt(e.target.value)}
                                        className="text-[9px] w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-700 px-1.5 py-1 text-gray-800 dark:text-white focus:outline-none"
                                      />
                                      <button
                                        onClick={() => handleReschedule(evt.id)}
                                        disabled={!rescheduleAt || rescheduling}
                                        className="text-[9px] font-bold bg-[#E8734A] text-white rounded-lg py-1 disabled:opacity-50 flex items-center justify-center gap-1"
                                      >
                                        {rescheduling ? <Loader2 size={8} className="animate-spin" /> : <Check size={8} />}
                                        Xác nhận
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Upcoming */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <Clock className="text-[#E8734A]" size={20} /> Sắp diễn ra
            </h3>

            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Chưa có lịch đăng bài nào</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map(item => (
                  <div key={item.id} className="flex gap-4 items-start group cursor-pointer">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${PLATFORM_COLORS[item.platform] ?? "bg-gray-500"}`}>
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#E8734A] transition-colors truncate">
                        {item.content.caption.slice(0, 40)}{item.content.caption.length > 40 ? "…" : ""}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium capitalize">
                        {item.platform} • {relativeTime(item.scheduledAt)}
                      </p>
                      {item.isOptimized && (
                        <span className="text-[10px] text-[#E8734A] font-bold flex items-center gap-1 mt-0.5">
                          <Sparkles size={10} /> AI tối ưu
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="w-full mt-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Xem tất cả
            </button>
          </div>

          {/* Golden Hours */}
          <div className="flex-1 bg-[#FEFAF7] dark:bg-[#E8734A]/5 rounded-[32px] shadow-sm border border-[#E8734A]/20 p-6 sm:p-8 flex flex-col relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#E8734A] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[50px] opacity-20 pointer-events-none" />

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 relative z-10">
              <AlertCircle className="text-amber-500" size={20} /> AI Gợi ý Giờ Vàng
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-6 relative z-10">
              Dựa trên phân tích tương tác & benchmark nền tảng
            </p>

            <div className="space-y-4 flex-1 relative z-10">
              {goldenHours.length === 0 ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="animate-spin text-[#E8734A]" size={20} />
                </div>
              ) : (
                goldenHours.map(gh => (
                  <div key={gh.key} className={`${PLATFORM_BG[gh.key] ?? "bg-gray-50"} p-4 rounded-2xl border border-white/50 dark:border-white/5`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-black uppercase tracking-wider ${PLATFORM_TEXT[gh.key] ?? "text-gray-600"}`}>
                        {gh.platform}
                      </span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {slotTimeRange(gh.slot)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {DAY_VN[gh.slot.dayOfWeek]} •{" "}
                      {gh.source === "historical"
                        ? "Dựa trên lịch sử tương tác của bạn"
                        : "Benchmark trung bình ngành"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-lg border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Lên lịch bài mới</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Content selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Chọn nội dung (bản nháp)
                </label>
                {contentLoading ? (
                  <div className="flex items-center justify-center h-12">
                    <Loader2 className="animate-spin text-[#E8734A]" size={20} />
                  </div>
                ) : contents.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Không có nội dung nháp. Hãy tạo nội dung trước.
                  </p>
                ) : (
                  <select
                    value={selectedContentId}
                    onChange={e => setSelectedContentId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E8734A]/50"
                  >
                    <option value="">-- Chọn bài viết --</option>
                    {contents.map(c => (
                      <option key={c.id} value={c.id}>
                        [{c.platform.toUpperCase()}] {c.caption.slice(0, 60)}{c.caption.length > 60 ? "…" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Scheduled time */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Thời gian đăng (tùy chọn)
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Để trống để AI chọn giờ vàng tối ưu
                </p>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E8734A]/50"
                />
              </div>
            </div>

            <div className="px-8 pb-8 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedContentId || submitting}
                className="flex-1 py-3 rounded-xl bg-[#E8734A] text-white text-sm font-bold shadow-md shadow-[#E8734A]/20 hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {submitting
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Sparkles size={16} />}
                {scheduledAt ? "Lên lịch" : "AI Tối ưu giờ"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Engagement Modal */}
      {engagementSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-md border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-white/5">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Nhập chỉ số bài đăng</h2>
                <p className="text-xs text-gray-400 mt-0.5">AI sẽ học để gợi ý giờ tốt hơn</p>
              </div>
              <button onClick={() => setEngagementSchedule(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-2 truncate">
                {engagementSchedule.content.caption.slice(0, 60)}{engagementSchedule.content.caption.length > 60 ? "…" : ""}
              </p>
              {([
                { key: "likes", label: "Lượt thích", icon: "👍" },
                { key: "comments", label: "Bình luận", icon: "💬" },
                { key: "clicks", label: "Lượt click", icon: "🖱️" },
                { key: "impressions", label: "Lượt hiển thị", icon: "👁️" },
              ] as const).map(field => (
                <div key={field.key} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{field.icon}</span>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 w-28 shrink-0">{field.label}</label>
                  <input
                    type="number"
                    min="0"
                    value={engagementData[field.key]}
                    onChange={e => setEngagementData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder="0"
                    className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E8734A]/50"
                  />
                </div>
              ))}
              <div className="bg-[#FDE8DF]/50 dark:bg-[#E8734A]/10 rounded-2xl p-4 border border-[#E8734A]/20">
                <p className="text-xs text-gray-500 mb-1">Score dự kiến</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E8734A] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Number(engagementScore()))}%` }}
                    />
                  </div>
                  <span className="text-lg font-black text-[#E8734A]">{engagementScore()}</span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8 flex gap-3">
              <button onClick={() => setEngagementSchedule(null)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                Hủy
              </button>
              <button
                onClick={handleEngagementSubmit}
                disabled={engagementSubmitting}
                className="flex-1 py-3 rounded-xl bg-[#E8734A] text-white text-sm font-bold shadow-md shadow-[#E8734A]/20 hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {engagementSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Lưu &amp; Học AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
