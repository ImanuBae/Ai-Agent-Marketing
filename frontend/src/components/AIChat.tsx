"use client";

import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import api from "@/lib/axios";

interface Message {
  text: string;
  sender: "ai" | "user";
}

export default function AIChat() {
  const { t } = useTranslation();
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Memoize welcome messages
  const welcomeMessages = useMemo<Message[]>(() => [
    { text: t("chat.welcome_msg"), sender: "ai" },
  ], [t]);

  const allMessages = useMemo(() => [...welcomeMessages, ...userMessages], [welcomeMessages, userMessages]);

  const handleSend = async (messageText: string = input) => {
    const textToSend = messageText.trim();
    if (!textToSend || loading) return;
    
    // Add user message to UI
    setUserMessages((prev) => [...prev, { text: textToSend, sender: "user" }]);
    if (messageText === input) setInput("");
    setLoading(true);

    try {
      // Prepare history for AI context
      const history = allMessages.slice(-10); // Last 10 messages for context

      const response = await api.post("/chat", {
        message: textToSend,
        history: history,
      });

      if (response.data.success) {
        setUserMessages((prev) => [
          ...prev,
          { text: response.data.data.text, sender: "ai" },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setUserMessages((prev) => [
        ...prev,
        { text: "Rất tiếc, đã có lỗi khi kết nối với MarketAI. Bạn vui lòng thử lại sau nhé!", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [allMessages, loading]);

  const quickSuggestions = [
    t("chat.suggest_mkt"),
    t("chat.suggest_ads"),
    t("chat.suggest_tiktok"),
  ];

  return (
    <section id="chat" className="fade-up fade-up-d1">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-white">
        <MessageCircle className="w-6 h-6 text-sky-400" /> {t("chat.assistant_title")}
      </h2>
      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        {/* Sidebar Suggestions */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">
            {t("chat.quick_suggestions")}
          </div>
          {quickSuggestions.map((s, i) => (
            <button
              key={i}
              disabled={loading}
              className="w-full text-left text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-gray-900 dark:text-gray-200 disabled:opacity-50"
              onClick={() => handleSend(s.replace(/^[^\s]+\s/, ""))}
            >
              {s}
            </button>
          ))}
          
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold mt-4 mb-2">
            {t("chat.history")}
          </div>
          <div className="text-[11px] text-gray-400 italic px-3">
            Lịch sử trò chuyện sẽ được tự động lưu trong các phiên tới.
          </div>
        </div>

        {/* Chat Window */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col" style={{ minHeight: "450px" }}>
          <div className="flex-1 p-4 space-y-4 overflow-auto max-h-[500px]" ref={chatAreaRef}>
            {allMessages.map((m, i) => (
              <div
                key={i}
                className={`${
                  m.sender === "ai"
                    ? "bg-gray-100 dark:bg-white/5 rounded-2xl rounded-tl-sm mr-auto"
                    : "accent-gradient text-white rounded-2xl rounded-tr-sm ml-auto"
                } px-4 py-3 max-w-[85%] text-sm shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {m.sender === "ai" && (
                  <div className="text-sky-400 text-[10px] font-black uppercase tracking-widest mb-1">🤖 MarketAI</div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
            ))}
            
            {loading && (
              <div className="bg-gray-100 dark:bg-white/5 rounded-2xl rounded-tl-sm mr-auto px-4 py-3 animate-pulse">
                <div className="text-sky-400 text-[10px] font-black uppercase tracking-widest mb-1">🤖 MarketAI</div>
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-white/10 p-4 flex items-center gap-3">
            <input
              type="text"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("chat.input_placeholder")}
              className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/20 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 placeholder-gray-500 text-gray-900 dark:text-white transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="shrink-0 aspect-square h-[48px] accent-gradient rounded-2xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
