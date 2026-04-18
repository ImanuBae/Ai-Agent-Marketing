"use client";

import { useState, useEffect } from "react";
import { FileText, Search, Filter, Eye, Trash2, CheckCircle, Clock, FileX, Loader2 } from "lucide-react";
import api from "@/lib/axios";

interface ContentItem {
  id: string;
  caption: string;
  platform: string;
  status: "draft" | "scheduled" | "published";
  createdAt: string;
  user?: { name: string; email: string };
  hashtags?: string[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminContentPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  const fetchContents = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (platformFilter !== "all") params.set("platform", platformFilter);

      const res = await api.get(`/content/history?${params}`);
      if (res.data.success) {
        setContents(res.data.data.contents || []);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch content", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContents(1);
  }, [statusFilter, platformFilter]);

  const getStatusBadge = (status: string) => {
    if (status === "published") return <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"><CheckCircle size={10} /> Đã đăng</span>;
    if (status === "scheduled") return <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"><Clock size={10} /> Lên lịch</span>;
    return <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"><FileX size={10} /> Nháp</span>;
  };

  const getPlatformLabel = (p: string) => ({ facebook: "Facebook", tiktok: "TikTok", linkedin: "LinkedIn", instagram: "Instagram", twitter: "Twitter/X" }[p] || p);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const filtered = contents.filter(c =>
    c.caption?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
            <FileText className="text-[#E8734A]" /> Quản lý nội dung AI
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Xem và quản lý toàn bộ nội dung được tạo bởi AI trên hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
          <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
            Tổng: <span className="text-white">{pagination.total}</span> bài viết
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm caption hoặc tên user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E8734A] transition"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#E8734A] transition cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="scheduled">Lên lịch</option>
            <option value="published">Đã đăng</option>
          </select>
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#E8734A] transition cursor-pointer"
          >
            <option value="all">Tất cả kênh</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-[28px] border border-white/5 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#E8734A] animate-spin" />
            <p className="text-gray-400 font-bold">Đang tải dữ liệu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <FileX size={36} className="text-gray-600" />
            <p className="font-bold">Không tìm thấy nội dung nào</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Nội dung</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Kênh</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Thời gian</th>
                <th className="px-5 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-sm font-medium text-gray-200 line-clamp-2">{item.caption}</p>
                    {item.hashtags && item.hashtags.length > 0 && (
                      <p className="text-[10px] text-gray-500 mt-1 truncate">{item.hashtags.slice(0, 3).join(" ")}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-gray-300 capitalize">
                      {getPlatformLabel(item.platform)}
                    </span>
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-5 py-4 text-xs text-gray-400 font-medium">{formatDate(item.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition">
                        <Eye size={14} />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => fetchContents(n)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                n === pagination.page ? "accent-gradient text-white shadow-lg shadow-[#E8734A]/20" : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
