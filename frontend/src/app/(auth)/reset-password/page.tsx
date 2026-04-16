"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [showPass, setShowPass] = useState({ next: false, confirm: false });
  const [form, setForm] = useState({ next: "", confirm: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.next !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (form.next.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setIsSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {isSuccess 
              ? "Mật khẩu của bạn đã được cập nhật thành công." 
              : "Vui lòng nhập mật khẩu mới cho tài khoản của bạn."}
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showPass.next ? "text" : "password"}
                  required
                  value={form.next}
                  onChange={(e) => setForm({...form, next: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white"
                  placeholder="Tối thiểu 8 ký tự"
                />
                <button type="button" onClick={() => setShowPass({...showPass, next: !showPass.next})} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass.next ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showPass.confirm ? "text" : "password"}
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({...form, confirm: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white"
                  placeholder="Nhập lại mật khẩu"
                />
                <button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 accent-gradient"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Cập nhật mật khẩu <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Mật khẩu mới đã được thiết lập. Bây giờ bạn có thể đăng nhập bằng thông tin mới.
            </p>
            <Link 
              href="/login"
              className="w-full block accent-gradient text-white py-3 rounded-xl font-bold text-sm shadow-lg"
            >
              Đến trang đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
