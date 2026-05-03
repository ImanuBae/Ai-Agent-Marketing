"use client";

import { Activity } from "lucide-react";

interface TrendChartProps {
  /** Mảng 7 phần tử tương ứng T2–CN */
  data: number[];
  /** Nhãn trục X, mặc định T2–CN */
  labels?: string[];
  title?: string;
  color?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export default function TrendChart({
  data,
  labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
  title = "Hoạt động 7 ngày",
  color = "#E8734A",
  emptyMessage,
  emptyAction,
}: TrendChartProps) {
  const maxBar = Math.max(...data, 1);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 min-h-[320px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity style={{ color }} size={20} />
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: color }}
          />
          Số lượng
        </div>
      </div>

      {/* Chart body */}
      <div className="relative h-48 mt-2 flex-1">
        {/* Y-axis labels */}
        <div className="absolute left-0 bottom-5 top-0 w-8 flex flex-col justify-between text-[10px] text-gray-400 font-medium">
          <span>{maxBar}</span>
          <span>{Math.ceil(maxBar * 0.75)}</span>
          <span>{Math.ceil(maxBar * 0.5)}</span>
          <span>{Math.ceil(maxBar * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Grid + bars */}
        <div className="absolute inset-0 ml-10 border-l border-b border-gray-100 dark:border-white/5 pb-5">
          {/* Dashed grid lines */}
          {[0.25, 0.5, 0.75].map((v) => (
            <div
              key={v}
              className="absolute w-full border-t border-dashed border-gray-200 dark:border-white/5"
              style={{ top: `${(1 - v) * 100}%` }}
            />
          ))}

          {/* Bars */}
          <div className="absolute inset-0 pt-2 flex items-end justify-between px-4 pb-0 gap-2">
            {data.map((val, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-end h-full flex-1 gap-1 group"
              >
                <div
                  className="w-full rounded-t-md transition-all duration-700 hover:opacity-80 relative min-h-[4px]"
                  style={{
                    height: `${(val / maxBar) * 90}%`,
                    background: color,
                  }}
                >
                  {val > 0 && (
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg transition-opacity whitespace-nowrap z-10">
                      {val}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-10 right-0 h-5 flex justify-between px-4 text-[10px] text-gray-400 font-medium">
          {labels.map((label) => (
            <span key={label} className="flex-1 text-center">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {data.every((v) => v === 0) && emptyMessage && (
        <div className="mt-4 text-center text-sm text-gray-400 font-medium">
          {emptyMessage} {emptyAction}
        </div>
      )}
    </div>
  );
}
