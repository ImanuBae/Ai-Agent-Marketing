"use client";

import { 
  Activity, 
  Terminal, 
  Database, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { useState } from "react";

const mockLogs = [
  { id: 1, type: "success", msg: "Hệ thống đã khởi tạo thành công và sẵn sàng hoạt động", time: new Date().toLocaleTimeString(), service: "System" },
];

export default function AdminSystemPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Hệ thống & Analytics</h1>
          <p className="text-gray-400">Theo dõi tài nguyên, định mức sử dụng và nhật ký hoạt động máy chủ.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold transition active:scale-95"
        >
          <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
              <Cpu size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-tight">CPU Usage</p>
              <p className="text-xs text-gray-500">8 vCPUs / 16 Threads</p>
            </div>
          </div>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-black text-white">0%</p>
            <p className="text-xs font-bold text-gray-500 italic">Idle</p>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="w-0 h-full bg-blue-500 rounded-full" />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-tight">Memory Usage</p>
              <p className="text-xs text-gray-500">0GB / 16GB Total</p>
            </div>
          </div>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-black text-white">0%</p>
            <p className="text-xs font-bold text-gray-500">Trống</p>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="w-0 h-full bg-purple-500 rounded-full" />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <Database size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-tight">Storage Capacity</p>
              <p className="text-xs text-gray-500">0GB / 500GB SSD</p>
            </div>
          </div>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-black text-white">0%</p>
            <p className="text-xs font-bold text-emerald-400">An toàn</p>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="w-0 h-full bg-emerald-500 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Analytics Mockup */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-blue-500" /> Lưu lượng API & AI
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition">WEEKLY</button>
              <button className="px-3 py-1 bg-blue-600 rounded-lg text-[10px] font-bold text-white transition">MONTHLY</button>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-2">
            {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative h-full bg-white/[0.02] rounded-t-lg">
                   <div style={{ height: `0%` }} className="bg-gradient-to-t from-blue-600/40 to-blue-500 w-full rounded-t-lg transition-all" />
                </div>
                <span className="text-[10px] text-gray-600 font-bold uppercase">{`T${i+1}`}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-4 pt-8 border-t border-white/5 text-white">
                <div className="text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Peak AI Tokens</p>
                    <p className="text-lg font-black">0 / hr</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Success Rate</p>
                    <p className="text-lg font-black text-gray-500">0%</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Avg. Latency</p>
                    <p className="text-lg font-black text-gray-500">0ms</p>
                </div>
          </div>
        </div>

        {/* Real-time Logs Viewer */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Terminal size={16} className="text-blue-500" /> Hệ thống Logs
            </h2>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Live Status</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[420px] p-4 text-[11px] font-mono no-scrollbar">
            <div className="space-y-4">
              {mockLogs.map((log) => (
                <div key={log.id} className="flex gap-3 leading-relaxed group">
                  <span className="text-gray-600 shrink-0">[{log.time}]</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        {log.type === "success" && <CheckCircle2 size={10} className="text-emerald-500" />}
                        {log.type === "info" && <Clock size={10} className="text-blue-500" />}
                        {log.type === "warning" && <AlertTriangle size={10} className="text-amber-500" />}
                        {log.type === "error" && <XCircle size={10} className="text-rose-500" />}
                        <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase ${
                            log.type === "success" ? "bg-emerald-500/10 text-emerald-500" :
                            log.type === "error" ? "bg-rose-500/10 text-rose-500" :
                            "bg-blue-500/10 text-blue-500"
                        }`}>{log.service}</span>
                    </div>
                    <p className={`${
                        log.type === "error" ? "text-rose-400" : 
                        log.type === "warning" ? "text-amber-300" : "text-gray-300"
                    }`}>{log.msg}</p>
                  </div>
                </div>
              ))}
              <div className="text-blue-500 animate-pulse">_ Waiting for activity...</div>
            </div>
          </div>
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition">
                    Tải Logs đầy đủ
                </button>
          </div>
        </div>
      </div>
    </div>
  );
}
