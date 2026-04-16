"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    try {
      await register(form);
    } catch {
      setError("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel – Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 40%, #8b5cf6 100%)" }}
      >
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

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
              Bắt đầu hành trình<br />
              <span className="text-blue-200">Marketing thông minh</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium max-w-sm mx-auto leading-relaxed">
              Tham gia cùng hơn 10,000+ marketer đang sử dụng AI để tối ưu hóa chiến lược của họ.
            </p>
          </div>

          <div className="space-y-3 max-w-xs mx-auto">
            {[
              "✅ Phân tích xu hướng thời gian thực",
              "✅ Tối ưu chiến dịch bằng AI",
              "✅ Báo cáo tự động hàng tuần",
              "✅ Miễn phí 14 ngày đầu",
            ].map((item) => (
              <div key={item} className="text-left text-blue-100 text-sm font-medium bg-white/10 rounded-xl px-4 py-2 border border-white/10">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8 relative">
          {/* Back to Home Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest mb-2 group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại trang chủ</span>
          </Link>

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
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Tạo tài khoản</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Bắt đầu trải nghiệm AI Marketing miễn phí</p>
          </div>

          {/* Social Signup */}
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
            <span className="mx-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">hoặc đăng ký bằng email</span>
            <div className="flex-grow border-t border-gray-200 dark:border-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0912 345 678"
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white placeholder-gray-400 shadow-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full bg-white dark:bg-slate-900 border rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white placeholder-gray-400 shadow-sm ${
                    form.confirm && form.password !== form.confirm
                      ? "border-red-400 focus:ring-red-400/30"
                      : "border-gray-200 dark:border-white/10"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="text-xs text-red-500 mt-1 font-medium">Mật khẩu không khớp</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500/30 w-4 h-4 mt-0.5 shrink-0"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed">
                Tôi đồng ý với{" "}
                <a href="#" className="text-blue-600 font-semibold hover:underline">Điều khoản dịch vụ</a>
                {" "}và{" "}
                <a href="#" className="text-blue-600 font-semibold hover:underline">Chính sách bảo mật</a>
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800/20 animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !agreed || (!!form.confirm && form.password !== form.confirm)}
              className="w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed accent-gradient"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Tạo tài khoản <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:text-blue-700 transition">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
