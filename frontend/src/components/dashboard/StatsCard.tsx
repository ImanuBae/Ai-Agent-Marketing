"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatsCardProps {
  name: string;
  value: string | number;
  change?: string;
  trending?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color: string;
  bg: string;
  onClick?: () => void;
}

export default function StatsCard({
  name,
  value,
  change,
  trending = "neutral",
  icon: Icon,
  color,
  bg,
  onClick,
}: StatsCardProps) {
  const trendingConfig = {
    up: {
      classes:
        "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20",
      icon: ArrowUpRight,
    },
    down: {
      classes:
        "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:border-red-500/20",
      icon: ArrowDownRight,
    },
    neutral: {
      classes:
        "bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:border-white/10",
      icon: Minus,
    },
  };

  const TrendIcon = trendingConfig[trending].icon;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 hover:-translate-y-1 transition-transform ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {name}
        </p>
        <div className={`p-2.5 rounded-[14px] ${bg} ${color}`}>
          <Icon size={18} />
        </div>
      </div>

      {/* Value */}
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
        {value}
      </h3>

      {/* Badge */}
      {change && (
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`flex items-center gap-1 font-bold px-2 py-1 rounded-full border ${trendingConfig[trending].classes}`}
          >
            <TrendIcon size={12} />
            {change}
          </div>
        </div>
      )}
    </div>
  );
}
