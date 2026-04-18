"use client";

import { useTranslation } from "@/i18n/LanguageContext";
import { Sparkles, ArrowRight, TrendingUp, FileText, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Hero() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <div id="home" className="relative pt-4 sm:pt-8 pb-16 sm:pb-20 px-2 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#E8734A]/6 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
        
        {/* Left: Text & CTA */}
        <div className="flex flex-col justify-center fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white dark:bg-white/5 border border-[#E8734A]/30 dark:border-white/10 shadow-sm mb-6 sm:mb-8 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 w-fit">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8734A]" />
            {t("hero.badge") || "Bán hàng thông minh với AI"}
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.08] tracking-tight text-gray-900 dark:text-white mb-5 sm:mb-6">
            {t("hero.title_part1") || "AI Agent"}{" "}
            <span className="text-accent-grad">
              {t("hero.title_part2") || "Marketing & Xu hướng"}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-xl max-w-xl leading-relaxed font-medium mb-8 sm:mb-10">
            {t("hero.subtitle") || "Phân tích xu hướng thị trường thời gian thực, tối ưu chiến dịch bằng trí tuệ nhân tạo."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-3 sm:gap-4 items-center mb-8 sm:mb-12">
            <button 
              onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
              className="accent-gradient px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-white text-sm sm:text-base shadow-lg shadow-[#E8734A]/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#E8734A]/30 active:scale-95 flex items-center gap-2"
            >
              {t("hero.start_now") || "Bắt đầu miễn phí"} <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              {t("hero.view_demo") || "Xem demo"}
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex -space-x-2.5">
              {["E8734A", "3B82F6", "10B981", "8B5CF6"].map((color, i) => (
                <div key={i} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{backgroundColor: `#${color}`}}>
                  {["A","B","C","D"][i]}
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight">
              <span className="font-black text-gray-900 dark:text-white">1,200+</span> marketers<br />
              tin dùng mỗi ngày
            </div>
          </div>
        </div>

        {/* Right: Product Mockup */}
        <div className="relative flex items-center justify-center py-6 lg:py-12 fade-up">
          
          {/* Main Card — Dashboard Mockup */}
          <div className="relative w-full max-w-sm sm:max-w-lg bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-5 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E8734A]/10 blur-3xl rounded-full -z-0" />
            
            {/* Mac-style header */}
            <div className="flex items-center justify-between mb-4 sm:mb-5 relative z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">Dashboard Tổng quan</div>
              <div className="w-6 h-6 rounded-full bg-[#E8734A]/20 flex items-center justify-center">
                <Sparkles size={12} className="text-[#E8734A]" />
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
              {[
                { label: "Bài viết AI", value: "145", color: "text-blue-500", bg: "bg-blue-500/10", icon: FileText },
                { label: "Lên lịch", value: "24", color: "text-amber-500", bg: "bg-amber-500/10", icon: Calendar },
                { label: "Viral Score", value: "92%", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: TrendingUp },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 dark:bg-slate-800/80 rounded-2xl p-2.5 sm:p-3 border border-gray-100 dark:border-white/5">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-1.5 sm:mb-2`}>
                    <stat.icon size={13} />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                  <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Mini Bar Chart */}
            <div className="bg-gray-50 dark:bg-slate-800/80 rounded-2xl p-2.5 sm:p-3 mb-3 sm:mb-4 border border-gray-100 dark:border-white/5 relative z-10">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2">Hiệu suất 7 ngày</p>
              <div className="flex items-end gap-1 h-12 sm:h-14">
                {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 h-full">
                    <div className="w-full rounded-t-sm bg-[#E8734A]" style={{ height: `${h}%` }} />
                    <div className="w-full rounded-t-sm bg-emerald-400" style={{ height: `${Math.round(h * 0.4)}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {['T2','T3','T4','T5','T6','T7','CN'].map(d => (
                  <span key={d} className="text-[9px] text-gray-400 flex-1 text-center">{d}</span>
                ))}
              </div>
            </div>

            {/* AI chip */}
            <div className="flex items-center gap-2 bg-[#FDE8DF]/60 dark:bg-[#E8734A]/10 border border-[#E8734A]/20 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 relative z-10">
              <Sparkles size={14} className="text-[#E8734A] shrink-0" />
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                <strong className="text-[#E8734A]">AI gợi ý:</strong> Đăng bài vào 19:30 tối nay để tăng 40% tương tác
              </p>
            </div>
          </div>

          {/* Floating chips — ẩn trên mobile nhỏ để tránh tràn */}
          <div className="hidden sm:flex absolute -top-4 -right-2 lg:-right-6 bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-bold items-center gap-2 z-20">
            <TrendingUp size={15} className="text-emerald-500" />
            <span className="text-gray-900 dark:text-white text-xs">+120% từ khóa viral</span>
          </div>
          <div className="hidden sm:flex absolute -bottom-4 -left-2 lg:-left-6 bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-bold items-center gap-2 z-20">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-gray-900 dark:text-white text-xs">AI đang phân tích...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
