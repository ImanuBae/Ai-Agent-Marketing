"use client";

import { MessageSquare, TrendingUp, Calendar, Share2, BarChart3, Sparkles, ArrowRight } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    color: "text-[#E8734A]",
    bg: "bg-[#E8734A]/10",
    title: "Content AI Creator",
    desc: "Tạo caption, hashtag, bài viết cho Facebook, TikTok, LinkedIn chỉ trong vài giây với AI phân tích ngữ cảnh thị trường Việt Nam.",
    tags: ["Auto Caption", "Hashtag AI", "Multi-platform"],
  },
  {
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "Market Trend Intelligence",
    desc: "Phát hiện từ khóa đang nổi, phân tích tốc độ tăng trưởng theo thời gian thực và nhận đề xuất chủ đề content tiềm năng viral.",
    tags: ["Realtime Keywords", "Sparkline Chart", "AI Topic Ideas"],
  },
  {
    icon: Calendar,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    title: "Smart Schedule Planner",
    desc: "Lên lịch đăng bài đa kênh trên calendar view trực quan. AI gợi ý khung giờ vàng để tối đa hóa reach và engagement.",
    tags: ["Calendar View", "Golden Hours AI", "Multi-channel"],
  },
  {
    icon: BarChart3,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    title: "Performance Analytics",
    desc: "Biểu đồ tương tác 7 ngày, tỷ lệ chuyển đổi và Activity Feed cập nhật liên tục giúp bạn ra quyết định nhanh hơn.",
    tags: ["7-day Chart", "Realtime Feed", "Conversion Rate"],
  },
  {
    icon: Share2,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    title: "Social Connect Hub",
    desc: "Kết nối Facebook, TikTok, LinkedIn qua OAuth 2.0 bảo mật. Quản lý toàn bộ quyền truy cập và trạng thái kết nối trong một giao diện.",
    tags: ["OAuth 2.0", "Facebook", "TikTok"],
  },
  {
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "AI Insight Engine",
    desc: "Engine AI phân tích hành vi người dùng, dự đoán xu hướng và đề xuất tối ưu chiến dịch theo từng ngành hàng và địa phương.",
    tags: ["AI Predictions", "Behavior Analysis", "Industry Specific"],
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto fade-up fade-up-d2">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-5">
          <Sparkles size={14} /> Tính năng nổi bật
        </div>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-5">
          Một nền tảng — <span className="text-accent-grad">Đầy đủ công cụ</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          Từ viết content AI đến phân tích xu hướng và lên lịch đăng đa kênh — MarketAI là trợ lý marketing toàn diện của bạn.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="group bg-white dark:bg-slate-900 rounded-[28px] p-7 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8734A]/0 to-[#E8734A]/0 group-hover:from-[#E8734A]/3 group-hover:to-transparent transition-all duration-500 rounded-[28px] pointer-events-none" />
            
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon size={24} />
            </div>

            {/* Text */}
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{feature.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-5">{feature.desc}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {feature.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full border border-gray-200 dark:border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12">
        <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl accent-gradient text-white font-bold shadow-lg shadow-[#E8734A]/20 hover:opacity-90 hover:scale-105 transition-all active:scale-95">
          Khám phá tất cả tính năng <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
