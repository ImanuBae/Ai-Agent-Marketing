"use client";

import React, { useState } from "react";
import { 
  Wand2, 
  Copy, 
  Check, 
  PlayCircle, // For TikTok icon
  Loader2,
  Save,
  Rocket,
  Globe, // Alternative for Facebook
  Users // Alternative for Linkedin
} from "lucide-react";

// Custom Brand Icons to fix missing lucide-react brand icons
const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import api from "@/lib/axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AIContentGenerator() {
  const [brief, setBrief] = useState("");
  const [platform, setPlatform] = useState<"facebook" | "linkedin" | "tiktok">("facebook");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{
    caption: string;
    hashtags: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!brief.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/content/generate", {
        brief,
        platform,
        tone,
      });

      if (response.data.success) {
        // The API returns { success: true, message: '...', data: { content: { ... }, hashtags: [...] } }
        // Looking at the controller: sendSuccess(res, '...', { content, hashtags })
        const { content, hashtags } = response.data.data;
        setGeneratedContent({
          caption: content.caption,
          hashtags: hashtags,
        });
      }
    } catch (err: any) {
      console.error("Lỗi sinh nội dung:", err);
      setError(err.response?.data?.message || "Đã có lỗi xảy ra khi gọi AI. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedContent) return;
    const text = `${generatedContent.caption}\n\n${generatedContent.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tones = [
    { id: "professional", label: "Chuyên nghiệp" },
    { id: "friendly", label: "Thân thiện" },
    { id: "trendy", label: "Bắt trend" },
    { id: "persuasive", label: "Thuyết phục" },
    { id: "funny", label: "Hài hước" },
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-[#FDE8DF] dark:bg-[#E8734A]/10 text-[#E8734A]">
              <Rocket size={24} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              Thông tin nội dung
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Bạn muốn viết về điều gì?
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Ví dụ: Giới thiệu bộ sưu tập giày thể thao mới cho mùa hè, chất liệu thoáng khí, giảm giá 20%..."
                className="w-full min-h-[160px] p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-[#E8734A] outline-none transition-all resize-none text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  Nền tảng
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "facebook", icon: FacebookIcon, color: "hover:text-[#E8734A]" },
                    { id: "tiktok", icon: PlayCircle, color: "hover:text-pink-600" },
                    { id: "linkedin", icon: LinkedinIcon, color: "hover:text-[#D4623C]" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id as any)}
                      className={cn(
                        "flex-1 flex items-center justify-center p-3 rounded-2xl border transition-all",
                        platform === p.id 
                          ? "bg-[#E8734A] border-[#E8734A] text-white shadow-lg shadow-[#E8734A]/20" 
                          : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 hover:border-[#E8734A]/30"
                      )}
                    >
                      <p.icon size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  Tone giọng
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#E8734A] text-gray-900 dark:text-white appearance-none"
                >
                  {tones.map((t) => (
                    <option key={t.id} value={t.id} className="dark:bg-slate-900">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !brief.trim()}
              className="w-full accent-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Đang sáng tạo...
                </>
              ) : (
                <>
                  <Wand2 />
                  Sinh nội dung ngay
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-white/5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Kết quả</h3>
            {generatedContent && (
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copied ? "Đã chép" : "Sao chép"}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[300px] bg-gray-50 dark:bg-white/5 rounded-2xl p-6 relative">
            {!generatedContent && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-[#FDE8DF] dark:bg-[#E8734A]/10 rounded-full flex items-center justify-center mb-4">
                  <Wand2 className="text-[#E8734A]" />
                </div>
                <p className="text-gray-500 font-bold">Chưa có nội dung</p>
                <p className="text-xs text-gray-400 mt-1">
                  Điền thông tin bên trái và nhấn nút "Sinh nội dung" để bắt đầu.
                </p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-[#E8734A] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold text-[#E8734A] animate-pulse">AI đang viết bài...</p>
                </div>
              </div>
            )}

            {generatedContent && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {generatedContent.caption}
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
                  {generatedContent.hashtags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-sm font-bold text-[#E8734A] bg-[#FDE8DF] dark:bg-[#E8734A]/10 px-3 py-1 rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
          </div>

          {generatedContent && (
            <button className="w-full mt-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              <Save size={18} /> Lưu vào chiến dịch
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
