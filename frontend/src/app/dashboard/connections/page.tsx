"use client";

import { useState, useEffect } from "react";
import { 
  Music2, 
  Link as LinkIcon, 
  Unlink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Plus
} from "lucide-react";
import Image from "next/image";

// Custom Social Icons to avoid library version issues
const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

interface SocialAccount {
  id: string;
  platform: "facebook" | "linkedin" | "tiktok";
  name: string;
  avatar: string;
  status: "active" | "expired";
  lastSync: string;
}

export default function ConnectionsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("social_accounts");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  useEffect(() => {
    // Analytics or other side effects (none currently needed for init)
  }, []);

  const saveAccounts = (newAccounts: SocialAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem("social_accounts", JSON.stringify(newAccounts));
  };

  const handleConnect = (platform: "facebook" | "linkedin" | "tiktok") => {
    setIsConnecting(platform);
    
    // Simulate OAuth Popup Flow
    setTimeout(() => {
      const mockNames = {
        facebook: "MarketAI Business Page",
        linkedin: "Nguyễn Văn A (Professional)",
        tiktok: "@marketaivn_official"
      };
      
      const newAccount: SocialAccount = {
        id: Math.random().toString(36).substr(2, 9),
        platform,
        name: mockNames[platform],
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${platform}`,
        status: "active",
        lastSync: new Date().toISOString()
      };
      
      saveAccounts([...accounts, newAccount]);
      setIsConnecting(null);
    }, 2000);
  };

  const handleDisconnect = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn ngắt kết nối tài khoản này?")) {
      saveAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const platforms = [
    {
      id: "facebook",
      name: "Facebook Page",
      description: "Kết nối để phân tích Insights và tự động đăng bài lên Fanpage.",
      icon: FacebookIcon,
      color: "bg-[#1877F2]",
      lightColor: "bg-[#1877F2]/10",
      textColor: "text-[#1877F2]"
    },
    {
      id: "linkedin",
      name: "LinkedIn Profile",
      description: "Đăng bài và theo dõi tương tác trên mạng lưới chuyên nghiệp.",
      icon: LinkedinIcon,
      color: "bg-[#0A66C2]",
      lightColor: "bg-[#0A66C2]/10",
      textColor: "text-[#0A66C2]"
    },
    {
      id: "tiktok",
      name: "TikTok Business",
      description: "Quản lý nội dung video ngắn và theo dõi xu hướng TikTok.",
      icon: Music2,
      color: "bg-black",
      lightColor: "bg-black/5",
      textColor: "text-black dark:text-white"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Kết nối mạng xã hội</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Liên kết các tài khoản MXH để tối ưu hóa sức mạnh của AI Marketing</p>
      </div>

      {/* Linked Accounts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Tài khoản đã kết nối ({accounts.length})
        </h3>
        
        {accounts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/5">
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có tài khoản nào được kết nối.</p>
            <p className="text-sm text-gray-400 mt-1">Chọn một nền tảng bên dưới để bắt đầu.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map(acc => {
              const platformInfo = platforms.find(p => p.id === acc.platform)!;
              return (
                <div key={acc.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-white/5 space-y-4 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${platformInfo.color} text-white`}>
                      <platformInfo.icon size={20} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      acc.status === "active" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}>
                      {acc.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Image 
                      src={acc.avatar} 
                      alt="Avatar" 
                      width={48} 
                      height={48} 
                      className="w-12 h-12 rounded-full border-2 border-gray-50 dark:border-white/5 shadow-sm" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{acc.name}</p>
                      <p className="text-[10px] text-gray-400">Đã kết nối: {new Date(acc.lastSync).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex gap-2">
                    <button 
                      onClick={() => alert("Đang đồng bộ dữ liệu...")}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition"
                    >
                      <RefreshCw size={14} /> Đồng bộ
                    </button>
                    <button 
                      onClick={() => handleDisconnect(acc.id)}
                      className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition"
                      title="Ngắt kết nối"
                    >
                      <Unlink size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Platforms Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          Thêm kết nối mới
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platforms.map(platform => (
            <div key={platform.id} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-white/5 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 ${platform.lightColor} rounded-bl-[100px] -mr-4 -mt-4 group-hover:scale-110 transition-transform duration-500`}></div>
              
              <div className={`w-14 h-14 rounded-2xl ${platform.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-${platform.id}-500/20`}>
                <platform.icon size={28} />
              </div>

              <h4 className="text-xl font-black text-gray-900 dark:text-white mb-3">{platform.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {platform.description}
              </p>

              <button
                onClick={() => handleConnect(platform.id as "facebook" | "linkedin" | "tiktok")}
                disabled={isConnecting !== null}
                className={`w-full py-4 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 ${
                  platform.id === 'tiktok' ? "bg-black text-white hover:bg-gray-800" : "accent-gradient text-white"
                }`}
              >
                {isConnecting === platform.id ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>Kết nối ngay <ExternalLink size={16} /></>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-500/20 flex gap-4">
        <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Lưu ý bảo mật</p>
          <p className="text-xs text-blue-700/80 dark:text-blue-300/60 leading-relaxed">
            MarketAI chỉ yêu cầu các quyền cần thiết để phân tích dữ liệu hiệu quả và đăng bài. Chúng tôi không thu thập thông tin đăng nhập cá nhân hay quyền quản trị tối cao của bạn.
          </p>
        </div>
      </div>
    </div>
  );
}
