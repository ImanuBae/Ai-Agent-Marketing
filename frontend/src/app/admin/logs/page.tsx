"use client";

import { useState } from "react";
import { Database, AlertTriangle, CheckCircle, Info, XCircle, RefreshCw } from "lucide-react";

const MOCK_LOGS = [
  { id: 1, level: "error", message: "Gemini API quota exceeded for user user_abc123", timestamp: "2026-04-17T06:30:00Z", source: "gemini.service" },
  { id: 2, level: "warn", message: "User login failed: invalid password (user@email.com)", timestamp: "2026-04-17T06:28:14Z", source: "auth.controller" },
  { id: 3, level: "info", message: "New user registered: nguyen@email.com", timestamp: "2026-04-17T06:25:50Z", source: "auth.controller" },
  { id: 4, level: "info", message: "Content created: caption for Facebook by user_xyz", timestamp: "2026-04-17T06:22:33Z", source: "content.controller" },
  { id: 5, level: "error", message: "Database connection timeout (retry 1/3)", timestamp: "2026-04-17T06:20:10Z", source: "prisma.utils" },
  { id: 6, level: "info", message: "Admin stats endpoint called", timestamp: "2026-04-17T06:18:09Z", source: "admin.controller" },
  { id: 7, level: "warn", message: "Token refresh attempted with expired refresh token", timestamp: "2026-04-17T06:15:22Z", source: "auth.middleware" },
  { id: 8, level: "info", message: "Schedule created for TikTok post at 20:00", timestamp: "2026-04-17T06:12:45Z", source: "content.controller" },
  { id: 9, level: "info", message: "User profile updated: user_abc123", timestamp: "2026-04-17T06:10:00Z", source: "user.controller" },
  { id: 10, level: "error", message: "Rate limit exceeded for IP 172.16.0.1", timestamp: "2026-04-17T06:05:55Z", source: "rate-limiter" },
];

export default function AdminLogsPage() {
  const [levelFilter, setLevelFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = levelFilter === "all" ? MOCK_LOGS : MOCK_LOGS.filter(l => l.level === levelFilter);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getLevelIcon = (level: string) => {
    if (level === "error") return <XCircle size={14} className="text-red-400 shrink-0" />;
    if (level === "warn") return <AlertTriangle size={14} className="text-amber-400 shrink-0" />;
    return <Info size={14} className="text-blue-400 shrink-0" />;
  };

  const getLevelBadge = (level: string) => {
    if (level === "error") return "bg-red-500/15 text-red-400 border-red-500/20";
    if (level === "warn") return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    return "bg-blue-500/15 text-blue-400 border-blue-500/20";
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit" });

  const counts = {
    error: MOCK_LOGS.filter(l => l.level === "error").length,
    warn: MOCK_LOGS.filter(l => l.level === "warn").length,
    info: MOCK_LOGS.filter(l => l.level === "info").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
            <Database className="text-[#E8734A]" /> Logs hệ thống
          </h1>
          <p className="text-gray-400 text-sm">Theo dõi các sự kiện, lỗi và cảnh báo từ backend.</p>
        </div>
        <button
          onClick={handleRefresh}
          className={`flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-300 hover:bg-white/10 transition ${isRefreshing ? "opacity-60" : ""}`}
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} /> Làm mới
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { level: "error", label: "Lỗi", count: counts.error, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          { level: "warn", label: "Cảnh báo", count: counts.warn, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { level: "info", label: "Thông tin", count: counts.info, icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
        ].map(s => (
          <button
            key={s.level}
            onClick={() => setLevelFilter(s.level === levelFilter ? "all" : s.level)}
            className={`rounded-2xl p-4 border transition-all hover:-translate-y-0.5 ${s.bg} ${levelFilter === s.level ? "ring-1 ring-white/20 scale-[0.98]" : ""}`}
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className={s.color} />
              {levelFilter === s.level && <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">đang lọc</span>}
            </div>
            <p className="text-2xl font-black text-white">{s.count}</p>
            <p className={`text-xs font-bold mt-1 ${s.color}`}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 rounded-[28px] border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Nhật ký sự kiện
            <span className="ml-2 text-gray-500 font-medium text-xs">({filtered.length} kết quả)</span>
          </h3>
          <button
            onClick={() => setLevelFilter("all")}
            className={`text-xs font-bold text-gray-400 hover:text-white transition ${levelFilter === "all" ? "opacity-50 cursor-default" : ""}`}
          >
            Xóa bộ lọc
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {filtered.map(log => (
            <div key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors group">
              {/* Level icon */}
              <div className="mt-0.5">{getLevelIcon(log.level)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getLevelBadge(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                    {log.source}
                  </span>
                </div>
                <p className="text-sm text-gray-300 font-medium leading-snug break-words">{log.message}</p>
              </div>

              {/* Timestamp */}
              <div className="text-[11px] font-mono text-gray-500 shrink-0">{formatTime(log.timestamp)}</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            <Database size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold">Không có log nào</p>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-600 font-medium">
        ⚠️ Tính năng log thực tế sẽ được kết nối với hệ thống logging backend trong phiên bản tiếp theo.
      </p>
    </div>
  );
}
