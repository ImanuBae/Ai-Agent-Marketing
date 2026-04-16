"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex">
      {/* Left Panel – Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 40%, #8b5cf6 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl" />

        <div className="relative z-10 text-center text-white space-y-8">
          <Link href="/" className="flex justify-center hover:opacity-80 transition-opacity">
            <Image
              src="/ChatGPT Image Apr 6, 2026, 01_39_17 PM.png"
              alt="AI Marketing Agent"
              width={160}
              height={160}
              className="h-32 w-auto object-contain"
              style={{ mixBlendMode: "screen", filter: "brightness(1.3) contrast(1.1)" }}
            />
          </Link>
          <div>
            <h1 className="text-4xl font-black leading-tight mb-3">
              AI Marketing<br />
              <span className="text-blue-200">Agent</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium max-w-sm mx-auto leading-relaxed">
              Phân tích xu hướng thị trường thời gian thực, tối ưu chiến dịch bằng trí tuệ nhân tạo.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {[
              { value: "89%", label: "Chính xác" },
              { value: "2.4M", label: "Dữ liệu" },
              { value: "10K+", label: "Người dùng" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center border border-white/20">
                <div className="text-xl font-black">{s.value}</div>
                <div className="text-xs text-blue-200 font-semibold mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8 relative">
          {/* Back to Home Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest mb-4 group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại trang chủ</span>
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <Link href="/">
              <Image 
                src="/ChatGPT Image Apr 6, 2026, 01_39_17 PM.png" 
                alt="Logo" 
                width={64} 
                height={64} 
                className="h-16 w-auto" 
              />
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Chào mừng trở lại!</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Vui lòng đăng nhập vào tài khoản của bạn</p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 shadow-sm">
              <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} className="w-5 h-5" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 shadow-sm">
              <Image src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" width={20} height={20} className="w-5 h-5" />
              Facebook
            </button>
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-white/10" />
            <span className="mx-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">hoặc đăng nhập bằng email</span>
            <div className="flex-grow border-t border-gray-200 dark:border-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mật khẩu</label>
                <Link href="#" className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white placeholder-gray-400 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500/30 w-4 h-4" />
              <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800/20 animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed accent-gradient"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Đăng nhập <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:text-blue-700 transition">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
