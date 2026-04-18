"use client";

import { 
  TrendingUp, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wand2, 
  Lightbulb,
  MoreVertical,
  PenTool
} from "lucide-react";

export default function TrendsPage() {
  const trends = [
    { id: 1, keyword: "Thời trang bền vững", volume: "124.5K", change: "+45%", status: "up", sparkline: "M0,30 Q10,20 20,25 T40,10 T60,15 T80,5 T100,0" },
    { id: 2, keyword: "AI Marketing", volume: "89.2K", change: "+120%", status: "up", sparkline: "M0,40 Q15,35 25,25 T50,20 T75,10 T100,5" },
    { id: 3, keyword: "Đồ uống Detox", volume: "45.1K", change: "-12%", status: "down", sparkline: "M0,5 Q20,10 40,5 T60,20 T80,30 T100,40" },
    { id: 4, keyword: "Du lịch tự túc", volume: "210K", change: "+15%", status: "up", sparkline: "M0,20 Q20,15 40,25 T60,10 T80,15 T100,5" },
    { id: 5, keyword: "Healthy food online", volume: "67.8K", change: "+8%", status: "up", sparkline: "M0,25 Q20,30 40,20 T60,25 T80,15 T100,10" },
  ];

  const ideas = [
    { id: 1, title: "5 Cách ứng dụng AI vào chiến dịch Marketing 2026", match: "98%", tag: "AI Marketing" },
    { id: 2, title: "BST Xanh: Xu hướng thời trang thân thiện môi trường", match: "92%", tag: "Thời trang bền vững" },
    { id: 3, title: "Mẹo du lịch tự túc Nhật Bản mùa hoa anh đào", match: "85%", tag: "Du lịch" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 min-h-[calc(100vh-100px)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white capitalize tracking-tight mb-1 flex items-center gap-2">
            <TrendingUp className="text-[#E8734A]" /> Tín hiệu thị trường
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Khám phá các từ khóa đang dẫn đầu xu hướng và nhận đề xuất từ AI.
          </p>
        </div>
        
        {/* Search & Filter */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm từ khóa, ngành hàng..."
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#E8734A] focus:ring-1 focus:ring-[#E8734A] transition-all text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trends Table (Col 2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Tìm Kiếm Thịnh Hành</h3>
            <button className="text-sm font-semibold text-[#E8734A] hover:text-[#d6653e] hover:underline transition">Xem theo ngành hàng</button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Từ khóa</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lưu lượng (Tháng)</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mức độ quan tâm</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Tùy chọn</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((trend) => {
                  const isUp = trend.status === "up";
                  return (
                    <tr key={trend.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                            trend.id <= 3 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400'
                          }`}>
                            #{trend.id}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{trend.keyword}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{trend.volume}</span>
                          <span className={`flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                            isUp ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' : 'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
                          }`}>
                            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {trend.change}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-8 w-24 flex items-center">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path 
                              d={trend.sparkline} 
                              fill="none" 
                              stroke={isUp ? "#10B981" : "#EF4444"} 
                              strokeWidth="3" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="drop-shadow-sm"
                            />
                            {/* Gradient fill under line */}
                            <path 
                              d={`${trend.sparkline} L100,40 L0,40 Z`} 
                              fill={isUp ? "url(#grad-up)" : "url(#grad-down)"} 
                              opacity="0.2"
                            />
                            <defs>
                              <linearGradient id="grad-up" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                              </linearGradient>
                              <linearGradient id="grad-down" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-white transition opacity-0 group-hover:opacity-100">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Suggestions (Col 1/3) */}
        <div className="lg:col-span-1 bg-[#FEFAF7] dark:bg-[#E8734A]/5 rounded-[32px] shadow-sm border border-[#E8734A]/20 dark:border-[#E8734A]/20 overflow-hidden flex flex-col relative w-full h-full">
          {/* Decorative mesh */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#E8734A] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] opacity-20 pointer-events-none"></div>

          <div className="p-6 sm:p-8 flex-1 flex flex-col relative z-10 w-full h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center">
                <Wand2 className="text-[#E8734A]" size={20} />
              </div>
              <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-[#E8734A] bg-[#FDE8DF] dark:bg-[#E8734A]/20 rounded-lg">AI Generated</span>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Chủ đề Content gợi ý</h3>
            
            <div className="space-y-4 flex-1">
              {ideas.map((idea) => (
                <div key={idea.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100/50 dark:border-white/5 hover:border-[#E8734A]/30 transition group flex flex-col w-full">
                  <div className="flex items-center gap-2 mb-2 w-full">
                    <Lightbulb size={14} className="text-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 capitalize truncate flex-1 min-w-0" title={idea.tag}>Trend: {idea.tag}</span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">Trùng khớp {idea.match}</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-snug group-hover:text-[#E8734A] transition-colors line-clamp-2 w-full">{idea.title}</h4>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 w-full flex-shrink-0">
                    <button className="flex items-center justify-between w-full text-xs font-bold text-[#E8734A] hover:text-[#d6653e] hover:pl-1 transition-all">
                      <span className="flex items-center gap-1"><PenTool size={12}/> Tạo bài viết ngay</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 rounded-xl border border-[#E8734A]/30 text-sm font-bold text-[#E8734A] hover:bg-[#E8734A]/5 transition-colors">
              Phân tích sâu hơn
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
