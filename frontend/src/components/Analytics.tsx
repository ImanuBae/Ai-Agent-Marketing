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
    <section id="analytics" className="fade-up fade-up-d4 pb-12">
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2 dark:text-white uppercase tracking-tighter">
        <BarChart3 className="w-6 h-6 text-sky-500" /> {t("analytics.title")}
      </h2>
      
      <div className="glass-card rounded-[32px] p-8 mb-6 shadow-xl overflow-hidden relative border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center justify-between mb-8">
          <div className="text-xs font-black text-gray-400 dark:text-gray-500 tracking-widest uppercase">
            {t("analytics.overview")}
          </div>
          <div className="flex gap-4 text-[10px] font-bold">
            <span className="flex items-center gap-1.5 dark:text-gray-500">
              <span className="w-2 h-2 rounded-full bg-blue-500/20"></span> {t("analytics.organic")}
            </span>
            <span className="flex items-center gap-1.5 dark:text-gray-500">
              <span className="w-2 h-2 rounded-full bg-indigo-500/20"></span> {t("analytics.paid")}
            </span>
          </div>
        </div>
        
        <div className="flex items-end gap-3 h-48 border-b border-gray-100 dark:border-white/5 pb-2">
          {mainData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 justify-end">
              <div className="w-full flex gap-1 items-end justify-center h-full">
                <div 
                  className="w-1/2 rounded-t-sm bg-sky-500/10" 
                  style={{ height: `${d.h1}%`, transition: `height 0.8s ${i * 50}ms ease-out` }}
                ></div>
                <div 
                  className="w-1/2 rounded-t-sm bg-indigo-500/10" 
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
        <div className="mini-chart rounded-3xl p-6 shadow-lg bg-blue-50/50 dark:bg-slate-900/40 border border-blue-100/50 dark:border-white/5">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">{t("analytics.conversion_rate")}</div>
          <div className="text-4xl font-black text-gray-300 dark:text-gray-700 mb-4 tracking-tighter">0%</div>
          <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5">
            <div className="h-full rounded-full bg-blue-500/20" style={{ width: "0%" }}></div>
          </div>
          <div className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-wider">{t("analytics.target")}: 0%</div>
        </div>
        
        <div className="mini-chart rounded-3xl p-6 shadow-lg bg-indigo-50/50 dark:bg-slate-900/40 border border-indigo-100/50 dark:border-white/5">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">{t("analytics.cpl")}</div>
          <div className="text-4xl font-black text-gray-300 dark:text-gray-700 mb-2 tracking-tighter">₫0</div>
          <div className="flex gap-1 h-10 items-end mb-4">
            {cplBars.map((h, i) => (
              <div 
                key={i} 
                className="rounded-sm flex-1 bg-indigo-500/10" 
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
