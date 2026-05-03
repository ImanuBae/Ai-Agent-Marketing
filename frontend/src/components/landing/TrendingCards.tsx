"use client";

import { TrendingUp, ShoppingBag, Video, Users, Heart, ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

export default function TrendingCards() {
  const { t } = useTranslation();
  const trendsData = t("trends.items") as unknown as { title: string, desc: string }[];

  const trends = [
    { title: trendsData[0].title, desc: trendsData[0].desc, growth: "0%", icon: ShoppingBag, color: "bg-blue-500/10 text-blue-500" },
    { title: trendsData[1].title, desc: trendsData[1].desc, growth: "0%", icon: Video, color: "bg-indigo-500/10 text-indigo-500" },
    { title: trendsData[2].title, desc: trendsData[2].desc, growth: "0%", icon: Users, color: "bg-amber-500/10 text-amber-500" },
    { title: trendsData[3].title, desc: trendsData[3].desc, growth: "0%", icon: Heart, color: "bg-rose-500/10 text-rose-500" },
  ];

  return (
    <section id="trends" className="fade-up fade-up-d2">
      <div className="flex flex-col items-center text-center mb-10 fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-[#E8734A]/20 dark:border-white/10 shadow-sm text-xs font-bold text-gray-700 dark:text-gray-300 mb-4">
          <TrendingUp className="w-4 h-4 text-[#E8734A]" /> {t("trends.badge") || "Trending Now"}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t("trends.title")}
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trends.map((t, i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[24px] p-6 shadow-lg hover:shadow-xl card-glow transition-all duration-300 cursor-pointer">
            <div className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center mb-4 shadow-sm`}>
              <t.icon className="w-5 h-5" />
            </div>
            <div className="font-semibold mb-1 text-gray-900 dark:text-white">{t.title}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t.desc}</div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> {t.growth}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
