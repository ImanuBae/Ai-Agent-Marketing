"use client";

import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  LayoutDashboard
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { name: "Tổng tương tác", value: "0", change: "0%", trending: "up", icon: Users, color: "text-blue-600" },
    { name: "Tỷ lệ chuyển đổi", value: "0%", change: "0%", trending: "up", icon: Zap, color: "text-amber-500" },
    { name: "Chiến dịch chạy", value: "0", change: "0", trending: "up", icon: Calendar, color: "text-emerald-500" },
    { name: "AI Gợi ý", value: "0", change: "0", trending: "up", icon: MessageSquare, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase">
            CHÀO BUỔI TỐI, {user?.name.split(' ').pop()}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Đây là tổng quan hiệu suất marketing của bạn hôm nay.</p>
        </div>
        <button className="accent-gradient text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2">
          <TrendingUp size={18} /> Tạo chiến dịch mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-xl border border-gray-100 dark:border-white/5 hover:translate-y-[-4px] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
                stat.trending === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-100 text-red-600 dark:bg-red-500/10'
              }`}>
                {stat.trending === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">{stat.name}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Placeholder for Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-xl border border-gray-100 dark:border-white/5 min-h-[400px] flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <TrendingUp size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Biểu đồ tăng trưởng</h3>
          <p className="text-gray-500 text-sm max-w-xs">Chưa có dữ liệu để hiển thị biểu đồ. Hãy bắt đầu chiến dịch đầu tiên của bạn!</p>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-xl border border-gray-100 dark:border-white/5">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Hoạt động gần đây</h3>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4">
              <LayoutDashboard size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold">Chưa có hoạt động</p>
            <p className="text-xs text-gray-400 mt-1">Các hoạt động marketing của bạn sẽ xuất hiện tại đây.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
