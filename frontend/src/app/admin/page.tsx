"use client";

import { 
  Users, 
  Globe, 
  Zap, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

interface SystemStats {
  totalUsers: number;
  totalPosts: number;
  totalSchedules: number;
  aiTokensUsed: number;
  conversionRate: number;
  activeCampaigns: number;
  apiServerStatus: string;
  aiGatewayStatus: string;
  databaseStatus: string;
  storageUsage: number;
  recentAlerts: Array<{ title: string; time: string; type: string }>;
}

export default function AdminPage() {
  const [statsData, setStatsData] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          setStatsData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-400 font-bold animate-pulse">Đang thu thập dữ liệu hệ thống...</p>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Tổng người dùng", 
      value: statsData?.totalUsers.toLocaleString() || "0", 
      change: "+12.5%", 
      isPositive: true, 
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      label: "Chiến dịch đang chạy", 
      value: statsData?.totalSchedules.toLocaleString() || "0", 
      change: "+4.2%", 
      isPositive: true, 
      icon: Globe,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    { 
      label: "Token AI đã dùng", 
      value: `${(statsData?.aiTokensUsed || 0 / 1000).toFixed(0)}k`, 
      change: "-2.1%", 
      isPositive: false, 
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    { 
      label: "Tổng bài đăng AI", 
      value: statsData?.totalPosts.toLocaleString() || "0", 
      change: "+1.2%", 
      isPositive: true, 
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-white">
      <div>
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Hệ thống Overview</h1>
        <p className="text-gray-400">Chào mừng trở lại, Admin. Đây là tình trạng máy chủ hiện tại.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl hover:translate-y-[-4px] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            
            <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-blue-500" /> Trạng thái dịch vụ
            </h2>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded-full border border-emerald-500/20">
              Mọi thứ đều ổn định
            </span>
          </div>

          <div className="space-y-6">
            {[
              { name: "API Server", status: statsData?.apiServerStatus || "Stable", width: "w-0", color: "bg-blue-500" },
              { name: "AI Gateway (Gemini)", status: statsData?.aiGatewayStatus || "Stable", width: "w-0", color: "bg-purple-500" },
              { name: "Database (PostgreSQL)", status: statsData?.databaseStatus || "Active", width: "w-0", color: "bg-emerald-500" },
              { name: "File Storage", status: `${statsData?.storageUsage || 0}% Used`, width: "w-0", color: "bg-amber-500" },
            ].map((service) => (
              <div key={service.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-sm font-bold text-white uppercase tracking-tight">{service.name}</p>
                  <p className="text-[10px] font-medium text-gray-500">{service.status}</p>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${service.color} ${service.width} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertCircle className="text-amber-500" /> Thông báo mới
          </h2>
          <div className="space-y-4">
            {(statsData?.recentAlerts || []).map((alert, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition cursor-pointer">
                <div className={`w-1 h-8 rounded-full ${
                  alert.type === "warning" ? "bg-amber-500" : 
                  alert.type === "success" ? "bg-emerald-500" : "bg-blue-500"
                }`} />
                <div>
                  <p className="text-sm font-bold text-gray-200">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 rounded-2xl border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5 transition">
            Xem tất cả thông báo
          </button>
        </div>
      </div>
    </div>
  );
}
