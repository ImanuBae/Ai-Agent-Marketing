"use client";

import React from "react";
import AIContentGenerator from "@/components/content/AIContentGenerator";
import { Sparkles, History } from "lucide-react";

export default function ContentPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase flex items-center gap-3">
            <Sparkles className="text-blue-600" /> Sáng tạo nội dung AI
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Sử dụng trí tuệ nhân tạo để tạo ra những bài đăng thu hút chỉ trong vài giây.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-2xl font-bold text-sm shadow-md border border-gray-100 dark:border-white/5 hover:bg-gray-50 transition-all flex items-center gap-2">
            <History size={18} /> Lịch sử
          </button>
        </div>
      </div>

      {/* Main Generator Component */}
      <AIContentGenerator />
      
      {/* Tips Section or similar could go here */}
      <div className="bg-blue-600/5 dark:bg-blue-500/5 border border-blue-200/50 dark:border-blue-500/10 rounded-[32px] p-6">
        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          💡 Mẹo nhỏ cho bạn
        </h4>
        <p className="text-sm text-blue-800/70 dark:text-blue-200/60 leading-relaxed">
          Hãy mô tả sản phẩm của bạn càng chi tiết càng tốt (bao gồm tính năng, lợi ích, giá cả hoặc chương trình khuyến mãi). 
          AI sẽ hiểu rõ hơn và tạo ra nội dung phù hợp nhất với mục tiêu của bạn.
        </p>
      </div>
    </div>
  );
}
