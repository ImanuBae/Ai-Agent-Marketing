"use client";

import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Lock, 
  Unlock, 
  Shield, 
  Trash2,
  Mail,
  Calendar,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  isLocked: boolean;
  createdAt: string;
  avatar: string | null;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const fetchUsers = useCallback(async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const response = await api.get(`/users?page=${page}&limit=10&search=${search}`);
      if (response.data?.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      alert("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchUsers]);

  const handleToggleLock = async (userId: string) => {
    try {
      const response = await api.put(`/users/${userId}/toggle-lock`);
      if (response.data?.success) {
        alert(response.data.message);
        fetchUsers(pagination.page, searchTerm);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá vĩnh viễn người dùng này?")) return;
    
    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.data?.success) {
        alert("Xoá người dùng thành công");
        fetchUsers(pagination.page, searchTerm);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Xoá thất bại");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Quản lý người dùng</h1>
          <p className="text-gray-400">Xem danh sách, phân quyền và quản lý trạng thái tài khoản.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-600/20 active:scale-95">
          <UserPlus size={20} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-white/5 border border-white/10 rounded-3xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email..." 
            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl text-sm font-semibold text-gray-300 transition">
            <Filter size={18} />
            <span>Bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-blue-400 font-bold animate-pulse text-sm">Đang đồng bộ dữ liệu...</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-8 py-5">Người dùng</th>
                <th className="px-6 py-5">Vai trò</th>
                <th className="px-6 py-5">Trạng thái</th>
                <th className="px-6 py-5">Ngày tham gia</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Image 
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                          alt={user.name} 
                          width={44} 
                          height={44} 
                          className="rounded-full ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all"
                        />
                        <div>
                          <p className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{user.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                        user.role === "ADMIN" 
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      }`}>
                        <Shield size={10} />
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${
                        !user.isLocked ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${!user.isLocked ? "bg-emerald-400" : "bg-rose-400"} animate-pulse`} />
                        {!user.isLocked ? "Đang hoạt động" : "Bị khoá"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Calendar size={14} />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleToggleLock(user.id)}
                          className={`p-2 rounded-xl transition-all ${
                            !user.isLocked 
                              ? "hover:bg-rose-500/10 text-rose-400" 
                              : "hover:bg-emerald-500/10 text-emerald-400"
                          }`}
                          title={!user.isLocked ? "Khoá tài khoản" : "Mở khoá"}
                        >
                          {!user.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition" 
                          title="Xoá vĩnh viễn"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : !isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-500 italic">Không tìm thấy người dùng nào</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        
        {/* Pagination bar */}
        {pagination.totalPages > 1 && (
          <div className="px-8 py-5 bg-white/[0.03] border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} người dùng
            </p>
            <div className="flex gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(n => (
                <button 
                  key={n} 
                  onClick={() => fetchUsers(n, searchTerm)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                    n === pagination.page ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-white/10 text-gray-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
