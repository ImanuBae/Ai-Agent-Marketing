"use client";

import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus,
  AlertCircle,
  Video,
  FileText
} from "lucide-react";

export default function SchedulePage() {
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  
  // Dummy calendar data (starting from some Tuesday for offset)
  const blanks = Array(1).fill(null); 
  const daysInMonth = Array.from({length: 30}, (_, i) => i + 1);
  const calendarCells = [...blanks, ...daysInMonth];
  
  // Color code map
  // FB: blue, TikTok: black/red (using slate-900), LinkedIn: sky
  const events = [
    { day: 5, platform: "facebook", title: "Khuyến mãi hè", time: "19:30", type: "img" },
    { day: 7, platform: "tiktok", title: "Trend biến hình", time: "20:00", type: "video" },
    { day: 12, platform: "linkedin", title: "Mẹo AI Marketing", time: "09:00", type: "text" },
    { day: 15, platform: "facebook", title: "Mini Game", time: "20:00", type: "img" },
    { day: 22, platform: "tiktok", title: "Vlog hậu trường", time: "18:00", type: "video" },
    { day: 28, platform: "facebook", title: "Flash Sale", time: "12:00", type: "img" },
  ];

  const upcoming = [
    { id: 1, title: "Video Hướng dẫn phối đồ", platform: "TikTok", time: "Ngày mai, 19:00", color: "bg-slate-900", icon: Video },
    { id: 2, title: "Bài đăng Báo cáo Q1", platform: "LinkedIn", time: "Thứ 4, 08:30", color: "bg-sky-600", icon: FileText },
    { id: 3, title: "Mini-game tặng quà", platform: "Facebook", time: "Thứ 6, 20:00", color: "bg-blue-600", icon: FileText },
  ];

  const goldenHours = [
    { platform: "Facebook", time: "19:30 - 21:00", reason: "Tỷ lệ online cao nhất trong tuần theo dữ liệu Insight.", color: "text-blue-600", bg: "bg-blue-50" },
    { platform: "TikTok", time: "20:00 - 22:30", reason: "Khung giờ giải trí, tiếp cận 85% người trẻ theo dõi.", color: "text-slate-900 dark:text-white", bg: "bg-slate-100 dark:bg-slate-800" },
  ];

  const getDayEvents = (day: number | null) => {
    if (!day) return [];
    return events.filter(e => e.day === day);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white capitalize tracking-tight mb-1 flex items-center gap-2">
            <CalendarIcon className="text-[#E8734A]" /> Lên lịch & Đăng bài
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Quản lý chiến dịch nội dung đa kênh trên một giao diện duy nhất.
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-[#E8734A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#E8734A]/20 hover:opacity-90 hover:scale-[0.98] transition-all">
          <Plus size={18} /> Lên lịch bài mới
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Calendar Main View (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col">
          {/* Calendar Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tháng 4, 2026</h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                <ChevronLeft size={20} />
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                Hôm nay
              </button>
              <button className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="flex-1 flex flex-col p-4 bg-gray-50/30 dark:bg-slate-900/50">
            {/* Days header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Days grid */}
            <div className="flex-1 grid grid-cols-7 gap-2">
              {calendarCells.map((day, idx) => {
                const dayEvents = getDayEvents(day);
                const isToday = day === 14; 
                
                return (
                  <div 
                    key={idx} 
                    className={`min-h-[100px] bg-white dark:bg-slate-800 rounded-2xl border transition-colors group ${
                      isToday 
                        ? 'border-[#E8734A] shadow-sm shadow-[#E8734A]/10' 
                        : 'border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'
                    } p-2 flex flex-col`}
                  >
                    {day && (
                      <div className="flex-1 flex flex-col">
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1.5 ${
                          isToday ? 'bg-[#E8734A] text-white' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`}>
                          {day}
                        </span>
                        
                        <div className="flex flex-col gap-1 overflow-hidden">
                          {dayEvents.map((evt, i) => (
                            <div 
                              key={i} 
                              className={`text-[10px] font-bold px-2 py-1 rounded-md text-white truncate cursor-pointer transition hover:opacity-80 ${
                                evt.platform === 'facebook' ? 'bg-blue-600' :
                                evt.platform === 'tiktok' ? 'bg-slate-900 dark:bg-slate-700' :
                                'bg-sky-600'
                              }`}
                              title={`${evt.title} - ${evt.time}`}
                            >
                              {evt.time} {evt.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Upcoming Event */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <Clock className="text-[#E8734A]" size={20} /> Sắp diễn ra
            </h3>
            
            <div className="space-y-4">
              {upcoming.map(item => (
                <div key={item.id} className="flex gap-4 items-start group cursor-pointer">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${item.color}`}>
                    <item.icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#E8734A] transition-colors">{item.title}</h4>
                    <p className="text-xs text-gray-500 font-medium">{item.platform} • {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Xem tất cả
            </button>
          </div>

          {/* Golden Hours Suggestion */}
          <div className="flex-1 bg-[#FEFAF7] dark:bg-[#E8734A]/5 rounded-[32px] shadow-sm border border-[#E8734A]/20 dark:border-[#E8734A]/20 p-6 sm:p-8 flex flex-col relative overflow-hidden">
             {/* Decorative mesh */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#E8734A] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[50px] opacity-20 pointer-events-none"></div>

             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 relative z-10">
               <AlertCircle className="text-amber-500" size={20} /> AI Gợi ý Giờ Vàng
             </h3>
             <p className="text-xs text-gray-500 font-medium mb-6 relative z-10">Dựa trên phân tích tương tác 30 ngày qua</p>

             <div className="space-y-4 flex-1 relative z-10">
               {goldenHours.map((gh, idx) => (
                 <div key={idx} className={`${gh.bg} p-4 rounded-2xl border border-white/50 dark:border-white/5`}>
                   <div className="flex justify-between items-center mb-2">
                     <span className={`text-xs font-black uppercase tracking-wider ${gh.color}`}>{gh.platform}</span>
                     <span className="text-sm font-black text-gray-900 dark:text-white">{gh.time}</span>
                   </div>
                   <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                     {gh.reason}
                   </p>
                 </div>
               ))}
             </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
