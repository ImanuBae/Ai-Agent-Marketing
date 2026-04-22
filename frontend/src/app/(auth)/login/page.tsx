"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      await login(email, password);
    } catch {
      setError("Email hoặc mật khẩu không chính xác");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FEF3EE 0%, #FEFAF7 50%, #FDE8DF 100%)",
      }}
    >
      {/* Background decorative blobs */}
      <div
        className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F09070 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #E8734A 0%, transparent 70%)", filter: "blur(80px)" }}
      />
      <div
        className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full opacity-15 pointer-events-none -translate-y-1/2"
        style={{ background: "radial-gradient(circle, #F4A98C 0%, transparent 70%)", filter: "blur(70px)" }}
      />

      {/* Dark mode blobs */}
      <div className="dark:block hidden absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b18 50%, #0f172a 100%)"
      }} />
      <div className="dark:block hidden absolute top-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #E8734A 0%, transparent 70%)", filter: "blur(80px)" }} />

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#E8734A] transition-colors uppercase tracking-widest group z-10"
      >
        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span>Quay lại</span>
      </Link>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[440px] rounded-3xl shadow-2xl shadow-[#E8734A]/10 overflow-hidden fade-up"
        style={{
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        {/* Top accent stripe */}
        <div className="h-1.5 w-full accent-gradient" />

        <div className="px-8 py-9 dark:bg-slate-900/80">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="hover:opacity-80 transition-opacity mb-4">
              <span className="text-4xl text-[#E8734A] dark:text-white flex items-center justify-center h-14" style={{ fontFamily: '"Brush Script MT", cursive' }}>
                Imanu's Lab
              </span>
            </Link>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Chào mừng trở lại!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Đăng nhập vào tài khoản <span className="text-accent-grad font-semibold">MarketAI</span>
            </p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button className="flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 hover:border-[#E8734A]/40 hover:bg-[#E8734A]/5 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 shadow-sm group">
              <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={18} height={18} className="w-4.5 h-4.5" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 hover:border-[#E8734A]/40 hover:bg-[#E8734A]/5 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 shadow-sm group">
              <Image src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" width={18} height={18} className="w-4.5 h-4.5" />
              Facebook
            </button>
          </div>

          <div className="relative flex items-center mb-5">
            <div className="flex-grow h-px" style={{ background: "linear-gradient(to right, transparent, #e5e7eb, transparent)" }} />
            <span className="mx-3 text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap">hoặc đăng nhập bằng email</span>
            <div className="flex-grow h-px" style={{ background: "linear-gradient(to right, #e5e7eb, transparent)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/25 focus:border-[#E8734A] transition-all dark:text-white placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Mật khẩu</label>
                <Link href="#" className="text-xs text-[#E8734A] hover:text-[#D4623C] font-semibold transition">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/25 focus:border-[#E8734A] transition-all dark:text-white placeholder-gray-400 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E8734A] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 accent-[#E8734A] cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 font-medium bg-red-50 dark:bg-red-900/20 px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-800/30">
                <span className="shrink-0">⚠️</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg shadow-[#E8734A]/30 flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] hover:shadow-[#E8734A]/40 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed accent-gradient"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Đăng nhập <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-[#E8734A] font-bold hover:text-[#D4623C] transition">
              Đăng ký miễn phí
            </Link>
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-1 mt-5">
            <Sparkles className="w-3 h-3 text-[#E8734A]" />
            <span className="text-[10px] text-gray-400 font-medium">Bảo mật SSL 256-bit • 10,000+ người dùng tin tưởng</span>
          </div>
        </div>
      </div>

      {/* Dark mode card override */}
      <style>{`
        .dark [data-auth-card] {
          background: rgba(15, 23, 42, 0.85) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
      `}</style>
    </div>
  );
}
