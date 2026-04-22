"use client";

import { BarChart3, ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";

export default function Analytics() {
  const { t } = useTranslation();
  const months = t("analytics.months") as unknown as string[];
  const [mainData] = useState<{ h1: number, h2: number }[]>(() => 
    months.map((_, i) => ({
      h1: 0,
      h2: 0
    }))
  );
  const [cplBars] = useState<number[]>(() => 
    Array.from({ length: 8 }, (_, i) => 0)
  );

  // Note: Values are initialized once. In a real app, you might fetch these in useEffect.
  useEffect(() => {
    // Analytics initialization logic (if any)
  }, []);

  return (
    <section id="analytics" className="fade-up fade-up-d4 pb-4">
      <div className="flex flex-col items-center text-center mb-10 fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-[#E8734A]/20 dark:border-white/10 shadow-sm text-xs font-bold text-gray-700 dark:text-gray-300 mb-4">
          <BarChart3 className="w-4 h-4 text-[#E8734A]" /> {t("analytics.badge") || "Data Insights"}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t("analytics.title")}
        </h2>
      </div>
      
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[40px] p-8 sm:p-10 mb-8 shadow-xl hover:shadow-2xl overflow-hidden relative border border-white/60 dark:border-white/10 transition-all duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8734A]/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center justify-between mb-8">
          <div className="text-xs font-black text-gray-400 dark:text-gray-500 tracking-widest uppercase">
            {t("analytics.overview")}
          </div>
          <div className="flex gap-4 text-[10px] font-bold">
            <span className="flex items-center gap-1.5 dark:text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[#E8734A]/20"></span> {t("analytics.organic")}
            </span>
            <span className="flex items-center gap-1.5 dark:text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[#F09070]/20"></span> {t("analytics.paid")}
            </span>
          </div>
        </div>
        
        <div className="flex items-end gap-3 h-48 border-b border-gray-100 dark:border-white/5 pb-2">
          {mainData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 justify-end">
              <div className="w-full flex gap-1 items-end justify-center h-full">
                <div 
                  className="w-1/2 rounded-t-sm bg-[#E8734A]/10" 
                  style={{ height: `${d.h1}%`, transition: `height 0.8s ${i * 50}ms ease-out` }}
                ></div>
                <div 
                  className="w-1/2 rounded-t-sm bg-[#F09070]/10" 
                  style={{ height: `${d.h2}%`, transition: `height 0.8s ${i * 50}ms ease-out` }}
                ></div>
              </div>
              <div className="text-[10px] font-black text-gray-400 dark:text-gray-600 mt-2 uppercase">{months[i]}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-[10px] font-bold text-gray-400 italic">Chưa có dữ liệu phân tích</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="mini-chart rounded-[32px] p-8 shadow-lg hover:shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 transition-all duration-300">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">{t("analytics.conversion_rate")}</div>
          <div className="text-4xl font-black text-gray-300 dark:text-gray-700 mb-4 tracking-tighter">0%</div>
          <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5">
            <div className="h-full rounded-full bg-[#E8734A]/20" style={{ width: "0%" }}></div>
          </div>
          <div className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-wider">{t("analytics.target")}: 0%</div>
        </div>
        
        <div className="mini-chart rounded-[32px] p-8 shadow-lg hover:shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 transition-all duration-300">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">{t("analytics.cpl")}</div>
          <div className="text-4xl font-black text-gray-300 dark:text-gray-700 mb-2 tracking-tighter">₫0</div>
          <div className="flex gap-1 h-10 items-end mb-4">
            {cplBars.map((h, i) => (
              <div 
                key={i} 
                className="rounded-sm flex-1 bg-[#F09070]/10" 
                style={{ height: `10%`, transition: `height 0.5s ${i * 30}ms ease-out` }}
              ></div>
            ))}
          </div>
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-bold uppercase tracking-wider">
             {t("analytics.decrease_last_month")}: 0%
          </div>
        </div>
      </div>
    </section>
  );
}
