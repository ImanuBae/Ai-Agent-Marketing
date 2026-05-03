"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";

export default function CategoryTags() {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { emoji: "🎯", label: t("categories.items.all"), bg: "bg-gray-50 dark:bg-gray-800" },
    { emoji: "🍔", label: t("categories.items.food"), bg: "bg-orange-50 dark:bg-orange-900/30" },
    { emoji: "🥤", label: t("categories.items.beverage"), bg: "bg-blue-50 dark:bg-blue-900/30" },
    { emoji: "👗", label: t("categories.items.fashion"), bg: "bg-pink-50 dark:bg-pink-900/30" },
    { emoji: "💍", label: t("categories.items.accessories"), bg: "bg-purple-50 dark:bg-purple-900/30" },
    { emoji: "💻", label: t("categories.items.technology"), bg: "bg-sky-50 dark:bg-sky-900/30" },
    { emoji: "💄", label: t("categories.items.beauty"), bg: "bg-rose-50 dark:bg-rose-900/30", hidden: true },
    { emoji: "🏋️", label: t("categories.items.fitness"), bg: "bg-emerald-50 dark:bg-emerald-900/30", hidden: true },
    { emoji: "🏠", label: t("categories.items.home"), bg: "bg-amber-50 dark:bg-amber-900/30", hidden: true },
    { emoji: "🧸", label: t("categories.items.kids"), bg: "bg-teal-50 dark:bg-teal-900/30", hidden: true },
    { emoji: "🐶", label: t("categories.items.pet"), bg: "bg-yellow-50 dark:bg-yellow-900/30", hidden: true },
    { emoji: "📚", label: t("categories.items.education"), bg: "bg-indigo-50 dark:bg-indigo-900/30", hidden: true },
    { emoji: "📖", label: t("categories.items.book"), bg: "bg-cyan-50 dark:bg-cyan-900/30", hidden: true },
  ];

  return (
    <section className="fade-up fade-up-d3">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 bg-[#E8734A] rounded-full"></div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
            {t("categories.title")}
          </h2>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs sm:text-sm font-medium text-[#E8734A] hover:text-[#D4623C] transition flex items-center"
        >
          {showAll ? t("categories.show_less") : t("categories.show_all")}{" "}
          <ChevronDown className={`w-4 h-4 ml-0.5 transition-transform ${showAll ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-3.5 pb-4">
        {categories.map((cat, i) => (
          <button
            key={i}
            className={`${cat.hidden && !showAll ? "hidden" : "flex"} shrink-0 flex flex-col items-center justify-center gap-2 w-24 h-24 rounded-[20px] ${cat.bg} backdrop-blur-md border border-white/60 dark:border-white/5 hover:brightness-105 transition-all hover:-translate-y-1 cursor-pointer shadow-md hover:shadow-xl`}
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{cat.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
