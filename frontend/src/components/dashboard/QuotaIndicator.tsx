"use client";

import { useEffect, useState } from "react";
import { Zap, Loader2, Info } from "lucide-react";
import api from "@/lib/axios";

interface QuotaData {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetAt: string;
}

export default function QuotaIndicator() {
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const response = await api.get("users/quota/status");
        if (response.data?.success) {
          setQuota(response.data.data.quota);
        }
      } catch (error) {
        console.error("Failed to fetch quota", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuota();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang tải quota...</span>
        </div>
      </div>
    );
  }

  if (!quota) return null;

  const getStatusColor = () => {
    if (quota.percentage >= 90) return "bg-red-500";
    if (quota.percentage >= 75) return "bg-orange-500";
    return "bg-green-500";
  };

  const getStatusTextClass = () => {
    if (quota.percentage >= 90) return "text-red-600 dark:text-red-400";
    if (quota.percentage >= 75) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 shadow-sm rounded-2xl p-4 flex flex-col gap-3 mx-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-white/5`}>
            <Zap className={`w-4 h-4 ${getStatusTextClass()}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">
              AI Quota
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              Reset lúc nửa đêm (UTC)
            </p>
          </div>
        </div>
        <div className={`text-sm font-black ${getStatusTextClass()}`}>
          {quota.remaining} / {quota.limit}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden relative">
        <div 
          className={`h-full ${getStatusColor()} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(quota.percentage, 100)}%` }}
        />
      </div>

      {quota.percentage >= 90 && (
        <div className="flex items-start gap-1.5 mt-1">
          <Info className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-600 dark:text-red-400 leading-tight">
            Sắp hết giới hạn AI hôm nay. Hãy sử dụng tiết kiệm!
          </p>
        </div>
      )}
    </div>
  );
}
