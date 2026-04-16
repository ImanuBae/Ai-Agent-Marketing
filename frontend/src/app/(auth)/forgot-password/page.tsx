"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập email của bạn");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSent(true);
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Quên mật khẩu?</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {isSent 
              ? "Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn." 
              : "Nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email tài khoản</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed accent-gradient"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Gửi link khôi phục <Send className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </form>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Kiểm tra hộp thư đến (và cả thư rác) để tìm link đặt lại mật khẩu. Link có hiệu lực trong vòng 15 phút.
            </p>
            <button 
              onClick={() => setIsSent(false)}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition"
            >
              Thử lại với email khác
            </button>
          </div>
        )}

        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
