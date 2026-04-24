"use client";

import { MessageCircle, Send, Loader2, X, Sparkles, Minimize2, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import api from "@/lib/axios";

interface Message {
  text: string;
  sender: "ai" | "user";
}

const QUICK_SUGGESTIONS = [
  "📊 Phân tích thị trường Q4",
  "🎯 Tối ưu chiến dịch ads",
  "📝 Trend TikTok tuần này",
];

export default function AIChatFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const welcomeMessages = useMemo<Message[]>(() => [
    {
      text: "Xin chào! Tôi có thể giúp bạn phân tích xu hướng, tối ưu chiến dịch marketing hoặc nghiên cứu thị trường. Bạn muốn bắt đầu với gì?",
      sender: "ai",
    },
  ], []);

  const allMessages = useMemo(
    () => [...welcomeMessages, ...userMessages],
    [welcomeMessages, userMessages]
  );

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasNewMessage(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleSend = async (messageText: string = input) => {
    // Strip leading emoji+space from quick suggestion buttons (e.g. "📊 Phân tích..." → "Phân tích...")
    // Only strip if it comes from a quick suggestion (not user-typed input)
    const textToSend = messageText === input
      ? messageText.trim()
      : messageText.trim().replace(/^\S+\s/, "");
    if (!textToSend || loading) return;

    setUserMessages((prev) => [...prev, { text: textToSend, sender: "user" }]);
    if (messageText === input) setInput("");
    setLoading(true);

    try {
      const history = allMessages.slice(-10);
      const response = await api.post("chat", {
        message: textToSend,
        history,
      });

      if (response.data.success) {
        setUserMessages((prev) => [
          ...prev,
          { text: response.data.data.text, sender: "ai" },
        ]);
        if (isMinimized) setHasNewMessage(true);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; code?: string };
      let errText = "Rất tiếc, đã có lỗi kết nối. Bạn vui lòng thử lại sau nhé!";
      if (!axiosErr.response) {
        errText = "Không kết nối được server. Hãy kiểm tra backend đang chạy chưa.";
      } else if (axiosErr.response.status === 401) {
        errText = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (axiosErr.response.status === 503) {
        errText = axiosErr.response.data?.message || "AI đang bận, vui lòng thử lại sau 30 giây.";
      } else if (axiosErr.response.data?.message) {
        errText = axiosErr.response.data.message;
      }
      setUserMessages((prev) => [...prev, { text: errText, sender: "ai" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatAreaRef.current && !isMinimized) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [allMessages, loading, isMinimized]);

  return (
    <>
      {/* Chat Popup Window */}
      <div
        className={`fixed bottom-24 right-6 z-[999] flex flex-col transition-all duration-300 origin-bottom-right ${
          isOpen && !isMinimized
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ width: "380px", height: "520px" }}
      >
        <div className="flex flex-col h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 accent-gradient shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm leading-none">Imanu's Lab AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-white/70 text-[10px] font-medium">Hoạt động</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white"
                title="Thu nhỏ"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          {userMessages.length === 0 && (
            <div className="flex gap-2 px-4 pt-3 pb-1 shrink-0 overflow-x-auto no-scrollbar">
              {QUICK_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  disabled={loading}
                  className="shrink-0 text-[11px] font-semibold bg-gray-100 hover:bg-[#FDE8DF] border border-gray-200 hover:border-[#E8734A]/30 text-gray-700 rounded-full px-3 py-1.5 transition whitespace-nowrap disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div
            ref={chatAreaRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar"
          >
            {allMessages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-7 h-7 rounded-full accent-gradient flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.sender === "ai"
                      ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                      : "accent-gradient text-white rounded-tr-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full accent-gradient flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#E8734A] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#E8734A] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#E8734A] rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2 shrink-0 bg-white/80">
            <input
              ref={inputRef}
              type="text"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập câu hỏi..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/30 focus:border-[#E8734A] placeholder-gray-400 text-gray-900 transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="shrink-0 w-10 h-10 accent-gradient rounded-2xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#E8734A]/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Minimized bar */}
      {isOpen && isMinimized && (
        <div
          className="fixed bottom-24 right-6 z-[999] cursor-pointer"
          onClick={() => { setIsMinimized(false); setHasNewMessage(false); }}
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl accent-gradient shadow-xl shadow-[#E8734A]/30 border border-white/20">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">Imanu's Lab AI</span>
            {hasNewMessage && (
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
            <ChevronDown className="w-4 h-4 text-white/80 rotate-180" />
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[999] group"
          aria-label="Mở AI Chat"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full accent-gradient opacity-30 animate-ping" style={{ animationDuration: "2.5s" }} />
          
          <div className="relative w-14 h-14 rounded-full accent-gradient shadow-2xl shadow-[#E8734A]/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 border-2 border-white/30">
            <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-16 right-0 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none shadow-lg translate-y-1 group-hover:translate-y-0">
            Hỏi AI ngay
            <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </button>
      )}
    </>
  );
}
