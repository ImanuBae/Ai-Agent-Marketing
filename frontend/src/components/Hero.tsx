"use client";

import { ArrowRight, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";

export default function Hero() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [bars, setBars] = useState<number[]>(new Array(20).fill(10));

  useEffect(() => {
    setMounted(true);
    // Set initial random values after mount to avoid hydration error
    setBars(Array.from({ length: 20 }, () => 30 + Math.random() * 40));

    // Animate bars regularly
    const interval = setInterval(() => {
      setBars(Array.from({ length: 20 }, () => 30 + Math.random() * 60));
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="home" className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mt-8">
      {/* Decorative background blobs */}
      <div className="mesh-blob w-72 h-72 bg-blue-500/10 -top-20 -left-20 animate-pulse"></div>
      <div className="mesh-blob w-96 h-96 bg-purple-500/10 -bottom-20 -right-20"></div>
      
      <section className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center fade-up p-10 md:p-12 lg:p-16 rounded-[40px] relative overflow-hidden hero-banner min-h-[480px] shadow-2xl border border-white/5">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tighter text-gray-900 dark:text-white uppercase transition-all">
            {t("hero.title_part1")}<br />
            <span className="text-accent-grad">{t("hero.title_part2")}</span>
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-lg sm:text-xl max-w-lg leading-relaxed font-bold tracking-tight opacity-90">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-5 pt-2">
            <button className="accent-gradient px-10 py-4 rounded-full font-black text-white shadow-[0_10px_30_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-3 text-base hover:scale-105 active:scale-95 uppercase tracking-widest">
              {t("hero.start_now")} <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 px-10 py-4 rounded-full font-black transition-all flex items-center justify-center gap-3 text-base hover:bg-white dark:hover:bg-white/10 hover:scale-105 active:scale-95 uppercase tracking-widest shadow-xl">
              <Play className="w-5 h-5 fill-current opacity-80" /> {t("hero.view_demo")}
            </button>
          </div>
        </div>

        <div className="relative animate-float pt-10 md:pt-0">
          <div className="glass-card rounded-[48px] p-8 md:p-10 space-y-10 shadow-2xl relative z-10 border border-white/30 backdrop-blur-2xl bg-white/40 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-emerald-500">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                {t("hero.ai_analyzing")}
              </div>
              <div className="text-[10px] text-gray-500 font-black tracking-widest uppercase opacity-60">Live v2.4</div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-white/60 dark:bg-white/5 rounded-3xl p-5 border border-white/40 dark:border-white/5 shadow-inner">
                <div className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">89%</div>
                <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-2">{t("hero.accuracy")}</div>
              </div>
              <div className="bg-white/60 dark:bg-white/5 rounded-3xl p-5 border border-white/40 dark:border-white/5 shadow-inner">
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">2.4M</div>
                <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-2">{t("hero.data")}</div>
              </div>
              <div className="bg-white/60 dark:bg-white/5 rounded-3xl p-5 border border-white/40 dark:border-white/5 shadow-inner">
                <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">156</div>
                <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-2">{t("hero.trends")}</div>
              </div>
            </div>

            <div className="h-32 rounded-[24px] bg-white/80 dark:bg-black/40 flex items-end gap-2 px-6 pb-5 overflow-hidden border border-white/20 shadow-inner">
              {mounted && bars.map((h, i) => (
                <div
                  key={i}
                  className="rounded-t-lg flex-1 bg-sky-500/50 shadow-[0_-5px_15px_rgba(59,130,246,0.3)]"
                  style={{ 
                    height: `${h}%`, 
                    transition: "height 0.8s ease-in-out",
                    backgroundColor: `rgba(59,130,246,${0.3 + (i % 8) / 10})`
                  }}
                ></div>
              ))}
              {!mounted && <div className="w-full h-full flex items-center justify-center text-gray-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Initializing AI...</div>}
            </div>
          </div>
          
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-[100px] -z-0"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-[100px] -z-0"></div>
        </div>
      </section>
    </div>
  );
}
