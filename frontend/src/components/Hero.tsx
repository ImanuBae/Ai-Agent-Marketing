"use client";

import { useTranslation } from "@/i18n/LanguageContext";
import { Sparkles, TrendingUp, FileText, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

export default function Hero() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [dbStats, setDbStats] = useState({ users: 342, posts: 894 });

  useEffect(() => {
    const fetchDbStats = async () => {
      try {
        const res = await api.get('/public/stats');
        if (res.data.success) {
          setDbStats({
            users: res.data.data.totalUsers || 342,
            posts: res.data.data.totalPosts || 0
          });
        }
      } catch (error) {
        // Fallback to static numbers on error
      }
    };
    fetchDbStats();
  }, []);

  return (
    <div id="home" className="relative pt-0 sm:pt-8 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto overflow-hidden border-[12px] border-white rounded-[40px] bg-white/20 shadow-sm mt-3 sm:mt-4">
      
      {/* Background glowing gradients (Softer and larger like the reference) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#E8734A]/10 rounded-[100%] blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#FDE8DF]/40 dark:bg-[#E8734A]/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Main Content Vertical Layout */}
      <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto z-10 relative">
        
        {/* Floating Badge (Pill) */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-white/10 shadow-sm mb-8 text-xs font-bold text-gray-700 dark:text-gray-300 w-fit drop-shadow-sm fade-up hover:scale-105 transition-transform cursor-pointer">
          <Sparkles className="w-4 h-4 text-[#E8734A]" />
          <span>{t("hero.badge") || "Phân tích xu hướng thông minh với AI"}</span>
        </div>

        {/* Huge Headline */}
        <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black leading-[1.05] tracking-tight text-gray-900 dark:text-white mb-6 fade-up fade-up-d1">
          {t("hero.title_part1") || "Cập nhật dữ liệu thời gian thực"}{" "}
          <span className="block mt-1">{t("hero.title_part2") || "Tối ưu hóa doanh nghiệp của bạn"}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl max-w-2xl leading-relaxed font-medium mb-10 fade-up fade-up-d2">
          {t("hero.subtitle") || "Gặp gỡ MarketAI — trung tâm điều khiển bán hàng tất cả trong một của bạn. Tự động hóa chiến dịch và tăng cường doanh thu với góc nhìn AI rõ ràng."}
        </p>

        {/* 2 Centered CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-16 fade-up fade-up-d3 w-full sm:w-auto">
          <button 
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
            className="w-full sm:w-auto accent-gradient px-8 py-3.5 rounded-xl font-bold text-white text-base shadow-lg shadow-[#E8734A]/30 transition-all hover:translate-y-[-2px] hover:shadow-[#E8734A]/40 active:scale-95"
          >
            {isAuthenticated ? "Bắt đầu Demo" : "Đăng ký sử dụng Demo"}
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById("features");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-white/10 text-gray-800 dark:text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-slate-700 active:scale-95"
          >
            Khám phá thêm
          </button>
        </div>

      </div>

      {/* Center Graphic / Dashboard App Fake Mockup Container */}
      <div className="relative mt-8 w-full max-w-5xl mx-auto flex items-center justify-center fade-up fade-up-d4 z-10 px-2 sm:px-0">
        
        <div className="relative w-full aspect-[16/9] sm:aspect-auto sm:h-[450px] bg-white dark:bg-[#1a2235] border-[6px] border-white dark:border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-t-[32px] sm:rounded-t-[40px] overflow-hidden -mb-16 sm:-mb-24 flex flex-col p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8734A]/5 blur-3xl rounded-full -z-0" />
            
            {/* Fake Traffic Light Header */}
            <div className="flex items-center justify-start gap-1.5 mb-8 relative z-10">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm border border-black/5" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm border border-black/5" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm border border-black/5" />
              <div className="ml-4 font-semibold text-[10px] uppercase tracking-widest text-gray-400">MarketAI Dashboard</div>
            </div>

            {/* Top Cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
              {[
                { label: "Doanh thu AI", value: "$0", trend: "0%", color: "text-gray-500", icon: TrendingUp },
                { label: "Khách hàng mới", value: dbStats.users.toString(), trend: "+5.2%", color: "text-emerald-500", icon: Calendar },
                { label: "Tổng số bài đăng", value: dbStats.posts.toString(), trend: "+24%", color: "text-emerald-500", icon: FileText },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50/80 dark:bg-slate-800/80 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-3 flex items-center justify-between">
                    {stat.label}
                    <stat.icon size={14} className="text-gray-400" />
                  </p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
                    <span className={`text-[11px] font-bold ${stat.color} bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md mb-1`}>{stat.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Fake Graph layout */}
            <div className="flex-1 w-full bg-gray-50/50 dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-white/5 relative z-10 flex flex-col p-5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Truy Cập Đa Kênh</h4>
                  <p className="text-xs text-gray-400 mt-1">1 Tháng qua</p>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#E8734A]" /> <span className="text-[10px] font-bold text-gray-500">Facebook</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-300" /> <span className="text-[10px] font-bold text-gray-500">TikTok</span></div>
                </div>
              </div>
              
              {/* Dummy bars */}
              <div className="flex-1 flex items-end justify-between gap-2 border-b border-gray-200 dark:border-white/10 pb-2">
                {[30, 45, 60, 40, 80, 55, 90, 70, 85, 50, 65, 45].map((h, i) => (
                  <div key={i} className="flex flex-col justify-end w-full max-w-[20px] h-full gap-1 group">
                    <div className="w-full bg-[#E8734A] rounded-t-sm group-hover:opacity-90 transition-opacity" style={{height: `${h}%`}} />
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-b-sm group-hover:opacity-90 transition-opacity" style={{height: `${h * 0.6}%`}} />
                  </div>
                ))}
              </div>
            </div>

        </div>

      </div>

    </div>
  );
}
