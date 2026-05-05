"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Share2, CheckCircle2, X, AlertCircle, HelpCircle,
  Lock, ArrowRight, Loader2, Clock,
} from "lucide-react";
import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  accountId: string;
  avatarUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
}

// ─── Platform config (static UI metadata) ────────────────────────────────────

const PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook Page",
    avatar: "M",
    color: "bg-[#1877F2]",
    bgColor: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
    textColor: "text-[#1877F2]",
    permissions: ["Đọc dữ liệu Insight", "Thay mặt bạn đăng bài", "Trả lời bình luận"],
    supported: true,
  },
  {
    id: "tiktok",
    name: "TikTok Business",
    avatar: "T",
    color: "bg-black dark:bg-slate-700",
    bgColor: "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10",
    textColor: "text-slate-900 dark:text-white",
    permissions: ["Lấy báo cáo Video", "Đăng tải Video tự động"],
    supported: false,
  },
  {
    id: "linkedin",
    name: "LinkedIn Profile",
    avatar: "in",
    color: "bg-[#0A66C2]",
    bgColor: "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20",
    textColor: "text-[#0A66C2]",
    permissions: ["Profile Analytics", "Share bài viết mới"],
    supported: true,
  },
];

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ type, msg, onClose }: { type: "success" | "error"; msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold transition-all animate-in fade-in slide-in-from-top-2 ${
      type === "success"
        ? "bg-emerald-500 text-white"
        : "bg-red-500 text-white"
    }`}>
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Main content (needs Suspense for useSearchParams) ────────────────────────

function SocialConnectContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => setToast({ type, msg });

  // Handle OAuth callback result from URL params
  useEffect(() => {
    const connected = searchParams.get("connected");
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (connected && success === "true") {
      showToast("success", `Kết nối ${connected} thành công!`);
      window.history.replaceState({}, "", "/dashboard/social");
      fetchAccounts();
    } else if (error) {
      showToast("error", decodeURIComponent(error));
      window.history.replaceState({}, "", "/dashboard/social");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await api.get("/social/accounts");
      setAccounts(res.data.data ?? []);
    } catch {
      // silently fail — user just sees all as disconnected
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const res = await api.get(`/social/auth-url/${platformId}`);
      window.location.href = res.data.data.url;
    } catch {
      showToast("error", "Không thể kết nối, thử lại sau");
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    setDisconnecting(platformId);
    try {
      await api.delete(`/social/${platformId}`);
      setAccounts((prev) => prev.filter((a) => a.platform !== platformId));
      showToast("success", `Đã ngắt kết nối ${platformId}`);
    } catch {
      showToast("error", "Ngắt kết nối thất bại, thử lại sau");
    } finally {
      setDisconnecting(null);
    }
  };

  const getAccount = (platformId: string) =>
    accounts.find((a) => a.platform === platformId) ?? null;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 min-h-[calc(100vh-100px)] flex flex-col">

      {toast && (
        <Toast type={toast.type} msg={toast.msg} onClose={() => setToast(null)} />
      )}

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
        {PLATFORMS.map((platform) => {
          const account = getAccount(platform.id);
          const isConnected = !!account;
          const isConnecting = connecting === platform.id;
          const isDisconnecting = disconnecting === platform.id;

          return (
            <div
              key={platform.id}
              className={`rounded-[32px] overflow-hidden shadow-sm border bg-white dark:bg-slate-900 flex flex-col transition-all hover:shadow-md ${
                isConnected
                  ? "border-gray-200 dark:border-white/5"
                  : "border-dashed border-gray-300 dark:border-white/20 opacity-80"
              }`}
            >
              {/* Card Header */}
              <div className={`p-6 ${platform.bgColor} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${platform.color}`}>
                    {account?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={account.avatarUrl} alt={account.accountName} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      platform.avatar
                    )}
                  </div>
                  <div>
                    <h3 className={`font-black tracking-tight ${platform.textColor}`}>
                      {platform.name}
                    </h3>
                    {loading ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                        <Loader2 size={10} className="animate-spin" /> Đang tải...
                      </span>
                    ) : isConnected ? (
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

                {!platform.supported && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock size={10} /> Sắp ra mắt
                  </span>
                )}
              </div>

              {/* Permissions */}
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

              {/* Footer Actions */}
              <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02]">
                {isConnected ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-900 border border-emerald-200">
                        {account.accountName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                          {account.accountName}
                        </span>
                        <span className="text-[10px] text-gray-400">Tài khoản hoạt động</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={isDisconnecting}
                      className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {isDisconnecting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <X size={14} />
                      )}
                      Ngắt kết nối
                    </button>
                  </div>
                ) : platform.supported ? (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    disabled={isConnecting || loading}
                    className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold shadow-md hover:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:scale-100"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Đang chuyển hướng...
                      </>
                    ) : (
                      <>
                        Kết nối ngay <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                    <Clock size={16} /> Sắp ra mắt
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="bg-[#FEFAF7] dark:bg-[#E8734A]/5 rounded-[32px] p-6 sm:p-8 flex items-start gap-4 border border-[#E8734A]/20">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm shrink-0">
          <AlertCircle className="text-amber-500" size={24} />
        </div>
        <div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Cam kết bảo mật & Quyền riêng tư
          </h4>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl">
            MarketAI sử dụng giao thức OAuth 2.0 chuẩn quốc tế để kết nối an toàn. Chúng tôi{" "}
            <strong>không lưu trữ mật khẩu</strong> mạng xã hội của bạn. Token được mã hoá
            AES-256-GCM trước khi lưu vào database. Bạn có thể thu hồi quyền bất cứ lúc nào.
          </p>
          <button className="mt-3 flex items-center gap-1 text-xs font-bold text-[#E8734A] hover:text-[#d6653e] hover:underline transition-all">
            <HelpCircle size={14} /> Đọc Chính sách bảo mật của bên thứ 3
          </button>
        </div>
      </div>

    </div>
  );
}

// ─── Page (Suspense wrapper required for useSearchParams) ─────────────────────

export default function SocialConnectPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#E8734A]" />
      </div>
    }>
      <SocialConnectContent />
    </Suspense>
  );
}
