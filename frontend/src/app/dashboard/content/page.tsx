"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send, Sparkles, Copy, Check, Clock,
  Image as ImageIcon, Hash, Type, AlignLeft, ChevronDown, AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

interface ContentResult {
  id: string;
  caption: string;
  hashtags: string[];
  platform: string;
  createdAt: string;
}

export default function ContentAIPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState("facebook");
  const [tone, setTone] = useState("Chuyên nghiệp");
  const [brief, setBrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ContentResult[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);

  const platforms = [
    { id: "facebook", label: "Facebook" },
    { id: "tiktok", label: "TikTok" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "instagram", label: "Instagram" },
    { id: "twitter", label: "Twitter/X" },
  ];
  const tones = ["Chuyên nghiệp", "Hài hước", "Truyền cảm hứng", "Ngắn gọn", "Bán hàng"];

  // Load history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/content/history?limit=5");
        if (res.data.success) {
          setHistory(res.data.data.contents || []);
        }
      } catch {
        // Silently fail — history is not critical
      }
    };
    fetchHistory();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await api.post("/content/generate", {
        brief,
        platform,
        tone,
      });

      if (res.data.success) {
        const { content } = res.data.data;
        setResult(content);
        // Prepend to local history
        setHistory(prev => [content, ...prev].slice(0, 5));
        // Scroll output into view
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Không thể kết nối AI. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.caption}\n\n${result.hashtags?.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadFromHistory = (item: ContentResult) => {
    setResult(item);
    setPlatform(item.platform);
  };

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white capitalize tracking-tight mb-1">
          Content AI Creator
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Tạo nội dung mạng xã hội tự động với Gemini AI
        </p>
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 p-6 sm:p-8 relative overflow-y-auto no-scrollbar">
          <form className="flex-1 flex flex-col gap-6" onSubmit={handleGenerate}>
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Chọn Nền tảng
              </label>
              <div className="flex flex-wrap gap-2">
                {platforms.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      platform === p.id
                        ? "accent-gradient text-white shadow-md shadow-[#E8734A]/20 scale-105"
                        : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="flex-1 flex flex-col">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                <AlignLeft size={16} className="text-[#E8734A]" /> Nội dung muốn truyền tải
              </label>
              <textarea
                value={brief}
                onChange={e => setBrief(e.target.value)}
                className="flex-1 min-h-[150px] resize-none bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#E8734A] focus:ring-1 focus:ring-[#E8734A] transition-all text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Ví dụ: Giới thiệu sản phẩm áo thun mới mùa hè 2026, phong cách tối giản, chất liệu cotton thoáng mát. Kêu gọi mua hàng với mã giảm giá SUMMER20."
                required
              />
            </div>

            {/* Tone Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                <Type size={16} className="text-[#E8734A]" /> Giọng văn (Tone)
              </label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full appearance-none bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#E8734A] transition-all cursor-pointer"
                >
                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              type="submit"
              disabled={isGenerating || !brief.trim()}
              className="mt-2 w-full py-3.5 px-6 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 accent-gradient hover:opacity-90 active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI Đang tạo nội dung...
                </>
              ) : (
                <><Sparkles size={18} /> Generate Content</>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Output & History */}
        <div className="lg:col-span-7 flex flex-col gap-6 min-h-0">

          {/* Output Card */}
          <div ref={outputRef} className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/5 flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="p-4 sm:px-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/2">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className={result ? "text-emerald-500" : "text-gray-400"} />
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {result ? "Kết quả từ Gemini AI" : "Kết quả AI sẽ xuất hiện ở đây"}
                </span>
              </div>
              {result && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-xs font-bold transition text-gray-700 dark:text-gray-300"
                >
                  {copied ? <><Check size={14} className="text-emerald-500" /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto no-scrollbar relative">
              {/* Loading overlay */}
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-slate-700 border-t-[#E8734A] animate-spin mb-4" />
                  <p className="text-sm font-bold text-[#E8734A] animate-pulse">Đang phân tích và tối ưu câu từ...</p>
                </div>
              )}

              {/* Empty state */}
              {!result && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Sparkles size={28} className="text-gray-300" />
                  </div>
                  <p className="font-bold text-gray-500 dark:text-gray-400 mb-1">Chưa có nội dung</p>
                  <p className="text-sm text-gray-400">Điền form bên trái và nhấn Generate để bắt đầu</p>
                </div>
              )}

              {/* Result */}
              {result && !isGenerating && (
                <>
                  <div className="prose prose-sm dark:prose-invert max-w-none font-medium leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {result.caption}
                  </div>

                  {/* Hashtags */}
                  {result.hashtags && result.hashtags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                      <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                        <Hash size={14} /> Hashtag đề xuất
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.hashtags.map(tag => (
                          <span
                            key={tag}
                            onClick={() => navigator.clipboard.writeText(tag)}
                            className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                            title="Click để copy"
                          >
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Actions */}
            {result && (
              <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 flex items-center justify-between">
                <div className="relative flex items-center">
                  <input 
                    type="file" 
                    id="imageUpload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedImage(e.target.files[0]);
                      }
                    }}
                  />
                  <label 
                    htmlFor="imageUpload" 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <ImageIcon size={16} className={selectedImage ? "text-emerald-500" : ""} /> 
                    {selectedImage ? (
                      <span className="text-emerald-500">{selectedImage.name.substring(0, 15)}{selectedImage.name.length > 15 ? '...' : ''}</span>
                    ) : "Đính kèm ảnh"}
                  </label>
                </div>
                <button
                  onClick={() => router.push("/dashboard/schedule")}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-200 text-white text-sm font-bold rounded-xl transition shadow-md"
                >
                  <Send size={16} /> Lên lịch đăng
                </button>
              </div>
            )}
          </div>

          {/* History Strip */}
          <div className="h-28 shrink-0 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-4 flex flex-col">
            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              <Clock size={14} /> Lịch sử sinh nội dung
            </h4>
            <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {history.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium">Chưa có lịch sử. Tạo nội dung đầu tiên của bạn!</p>
              ) : (
                history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => loadFromHistory(item)}
                    className="shrink-0 w-52 h-full bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-white/5 p-3 hover:border-[#E8734A]/40 dark:hover:border-[#E8734A]/40 cursor-pointer transition-colors text-left"
                  >
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate mb-1">
                      {item.caption?.slice(0, 40)}...
                    </p>
                    <p className="text-[10px] text-gray-400 capitalize">{item.platform}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
