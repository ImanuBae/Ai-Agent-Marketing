"use client";

import { Check, Sparkles, Zap, Building2, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Miễn phí",
    price: "0đ",
    period: "/tháng",
    desc: "Lý tưởng để trải nghiệm sức mạnh của AI Marketing.",
    icon: Sparkles,
    color: "text-gray-500",
    iconBg: "bg-gray-100 dark:bg-white/5",
    featured: false,
    cta: "Đăng ký miễn phí",
    ctaClass: "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10",
    features: [
      "10 bài viết AI / tháng",
      "Phân tích xu hướng cơ bản",
      "1 kênh mạng xã hội",
      "Báo cáo hàng tuần",
      "Hỗ trợ qua email",
    ],
    missing: ["Lên lịch đăng bài", "Gợi ý giờ vàng AI", "API Integration"],
  },
  {
    name: "Pro",
    price: "299.000đ",
    period: "/tháng",
    desc: "Cho cá nhân và team nhỏ muốn tăng tốc chiến dịch.",
    icon: Zap,
    color: "text-white",
    iconBg: "bg-white/20",
    featured: true,
    cta: "Dùng thử 14 ngày",
    ctaClass: "bg-white text-[#E8734A] hover:bg-gray-50 font-black",
    features: [
      "200 bài viết AI / tháng",
      "Phân tích xu hướng Realtime",
      "5 kênh mạng xã hội",
      "Lên lịch đăng bài thông minh",
      "AI gợi ý giờ vàng",
      "Báo cáo chi tiết hàng ngày",
      "Hỗ trợ ưu tiên 24/7",
    ],
    missing: [],
  },
  {
    name: "Enterprise",
    price: "Liên hệ",
    period: "",
    desc: "Giải pháp toàn diện cho doanh nghiệp và agency lớn.",
    icon: Building2,
    color: "text-blue-500",
    iconBg: "bg-blue-500/10",
    featured: false,
    cta: "Liên hệ tư vấn",
    ctaClass: "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100",
    features: [
      "Không giới hạn bài viết AI",
      "Tích hợp API riêng (White-label)",
      "Không giới hạn kênh MXH",
      "Quản lý team & phân quyền",
      "SLA 99.9% Uptime",
      "Dedicated Account Manager",
      "Đào tạo nhân viên onsite",
    ],
    missing: [],
  },
];

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto fade-up fade-up-d3">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8734A]/10 border border-[#E8734A]/20 text-[#E8734A] text-sm font-semibold mb-5">
          <Sparkles size={14} /> Bảng giá minh bạch
        </div>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-5">
          Chọn gói <span className="text-accent-grad">phù hợp</span> với bạn
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto leading-relaxed font-medium">
          Không có phí ẩn. Hủy bất cứ lúc nào. Miễn phí 14 ngày cho gói Pro.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`relative rounded-[32px] flex flex-col overflow-hidden transition-all duration-300 ${
              plan.featured
                ? "accent-gradient shadow-2xl shadow-[#E8734A]/25 scale-[1.03] z-10"
                : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1"
            }`}
          >
            {plan.featured && (
              <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/30">
                🔥 PHỔ BIẾN NHẤT
              </div>
            )}

            <div className="p-8 flex-1 flex flex-col">
              {/* Plan icon + name */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.iconBg} ${plan.color} shadow-sm`}>
                  <plan.icon size={22} />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${plan.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>
                    {plan.name}
                  </h3>
                </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                <span className={`text-4xl font-black ${plan.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm font-semibold ml-1 ${plan.featured ? "text-white/70" : "text-gray-500"}`}>
                  {plan.period}
                </span>
              </div>

              <p className={`text-sm font-medium mb-8 leading-relaxed ${plan.featured ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>
                {plan.desc}
              </p>

              {/* Features list */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-sm font-medium">
                    <Check size={16} className={`mt-0.5 shrink-0 ${plan.featured ? "text-white" : "text-emerald-500"}`} />
                    <span className={plan.featured ? "text-white/90" : "text-gray-700 dark:text-gray-300"}>{f}</span>
                  </li>
                ))}
                {plan.missing.map((f, fi) => (
                  <li key={`m-${fi}`} className="flex items-start gap-2.5 text-sm font-medium opacity-40">
                    <div className="w-4 h-4 mt-0.5 shrink-0 border border-gray-400 rounded-full" />
                    <span className="text-gray-500 dark:text-gray-400 line-through">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button 
                onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
                className={`w-full py-3.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${plan.ctaClass}`}
              >
                {plan.cta} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium mt-10">
        Thanh toán qua VNPay, MoMo, Visa, Mastercard • Hủy bất kỳ lúc nào • VAT đã bao gồm
      </p>
    </section>
  );
}
