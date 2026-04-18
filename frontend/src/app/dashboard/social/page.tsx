"use client";

import { 
  Share2, 
  CheckCircle2, 
  X,
  AlertCircle,
  HelpCircle,
  Lock,
  ArrowRight
} from "lucide-react";

export default function SocialConnectPage() {
  const platforms = [
    { 
      id: "facebook",
      name: "Facebook Page", 
      status: "connected", 
      account: "MarketAI Official",
      avatar: "M",
      color: "bg-[#1877F2]",
      bgColor: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
      textColor: "text-[#1877F2]",
      permissions: ["Đọc dữ liệu Insight", "Thay mặt bạn đăng bài", "Trả lời bình luận"]
    },
    { 
      id: "tiktok",
      name: "TikTok Business", 
      status: "connected", 
      account: "@market.ai",
      avatar: "T",
      color: "bg-black dark:bg-slate-700",
      bgColor: "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10",
      textColor: "text-slate-900 dark:text-white",
      permissions: ["Lấy báo cáo Video", "Đăng tải Video tự động"]
    },
    { 
      id: "linkedin",
      name: "LinkedIn Profile", 
      status: "disconnected", 
      account: null,
      avatar: "in",
      color: "bg-[#0A66C2]",
      bgColor: "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20",
      textColor: "text-[#0A66C2]",
      permissions: ["Profile Analytics", "Share bài viết mới"]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0 mb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white capitalize tracking-tight mb-1 flex items-center gap-2">
            <Share2 className="text-[#E8734A]" /> Social Connect
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Kết nối các kênh mạng xã hội để đồng bộ hóa chiến dịch và nhận báo cáo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const isConnected = platform.status === "connected";
          return (
            <div key={platform.id} className={`rounded-[32px] overflow-hidden shadow-sm border bg-white dark:bg-slate-900 ${
              isConnected ? 'border-gray-200 dark:border-white/5' : 'border-dashed border-gray-300 dark:border-white/20 opacity-80'
            } flex flex-col transition-all hover:shadow-md`}>
              
              {/* Card Header */}
              <div className={`p-6 ${platform.bgColor} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${platform.color}`}>
                    {platform.avatar}
                  </div>
                  <div>
                    <h3 className={`font-black tracking-tight ${platform.textColor}`}>{platform.name}</h3>
                    {isConnected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
                        <CheckCircle2 size={12} /> Đã kết nối
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
                        Chưa kết nối
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body - Permissions */}
              <div className="flex-1 p-6 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Lock size={14} /> Quyền truy cập
                </div>
                <ul className="space-y-3">
                  {platform.permissions.map((perm, idx) => (
                     <li key={idx} className="flex items-start gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                       <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                       <span className="leading-tight">{perm}</span>
                     </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer - Actions */}
              <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02]">
                {isConnected ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-900 border border-emerald-200">
                         {platform.account?.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                         <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{platform.account}</span>
                         <span className="text-[10px] text-gray-400">Tài khoản hoạt động</span>
                       </div>
                    </div>
                    <button className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                      <X size={14} /> Ngắt kết nối
                    </button>
                  </div>
                ) : (
                  <button className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold shadow-md hover:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    Kết nối ngay <ArrowRight size={16} />
                  </button>
                )}
              </div>

            </div>
          )
        })}
      </div>

      {/* Security Note */}
      <div className="bg-[#FEFAF7] dark:bg-[#E8734A]/5 rounded-[32px] p-6 sm:p-8 flex items-start gap-4 border border-[#E8734A]/20">
         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm shrink-0">
           <AlertCircle className="text-amber-500" size={24} />
         </div>
         <div>
           <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Cam kết bảo mật & Quyền riêng tư</h4>
           <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl">
             MarketAI sử dụng giao thức OAuth 2.0 chuẩn quốc tế để kết nối an toàn. Chúng tôi <strong>không lưu trữ mật khẩu</strong> mạng xã hội của bạn. Hệ thống chỉ yêu cầu những quyền tối thiểu cần thiết để thu thập số liệu và tự động đăng bài theo lịch bạn đã lên. Bạn có thể thu hồi quyền bất cứ lúc nào.
           </p>
           <button className="mt-3 flex items-center gap-1 text-xs font-bold text-[#E8734A] hover:text-[#d6653e] hover:underline transition-all">
             <HelpCircle size={14} /> Đọc Chính sách bảo mật của bên thứ 3
           </button>
         </div>
      </div>
      
    </div>
  );
}
