"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "Yếu", color: "#ef4444" };
  if (score <= 3) return { level: 2, label: "Trung bình", color: "#f59e0b" };
  return { level: 3, label: "Mạnh", color: "#10b981" };
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const passwordMismatch = !!form.confirm && form.password !== form.confirm;

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
    } catch (error: any) {
      // Extract error message from backend response
      const errorMessage = error?.response?.data?.message || error?.message || "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.";
      setError(errorMessage);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FEF3EE 0%, #FEFAF7 50%, #FDE8DF 100%)",
      }}
    >
      {/* Background decorative blobs */}
      <div
        className="absolute top-[-120px] right-[-80px] w-[450px] h-[450px] rounded-full opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F09070 0%, transparent 70%)", filter: "blur(70px)" }}
      />
      <div
        className="absolute bottom-[-80px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #E8734A 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      {/* Dark mode overlay */}
      <div className="dark:block hidden absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b18 50%, #0f172a 100%)"
      }} />
      <div className="dark:block hidden absolute top-[-120px] right-[-80px] w-[450px] h-[450px] rounded-full opacity-15 pointer-events-none"
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
        className="relative z-10 w-full max-w-[460px] rounded-3xl shadow-2xl shadow-[#E8734A]/10 overflow-hidden fade-up"
        style={{
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        {/* Top accent stripe */}
        <div className="h-1.5 w-full accent-gradient" />

        <div className="px-8 py-8 dark:bg-slate-900/80">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-7">
            <Link href="/" className="hover:opacity-80 transition-opacity mb-4">
              <Image
                src="/ChatGPT Image Apr 6, 2026, 01_39_17 PM.png"
                alt="AI Marketing Agent"
                width={64}
                height={64}
                className="h-14 w-auto logo-dark-fix object-contain"
                priority
              />
            </Link>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Tạo tài khoản
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Bắt đầu trải nghiệm <span className="text-accent-grad font-semibold">AI Marketing</span> miễn phí
            </p>
          </div>

          {/* Social Signup */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button className="flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 hover:border-[#E8734A]/40 hover:bg-[#E8734A]/5 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 shadow-sm">
              <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={18} height={18} />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 hover:border-[#E8734A]/40 hover:bg-[#E8734A]/5 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 shadow-sm">
              <Image src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" width={18} height={18} />
              Facebook
            </button>
          </div>

          <div className="relative flex items-center mb-5">
            <div className="flex-grow h-px" style={{ background: "linear-gradient(to right, transparent, #e5e7eb, transparent)" }} />
            <span className="mx-3 text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap">hoặc đăng ký bằng email</span>
            <div className="flex-grow h-px" style={{ background: "linear-gradient(to right, #e5e7eb, transparent)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name + Phone row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/25 focus:border-[#E8734A] transition-all dark:text-white placeholder-gray-400 shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="09xx xxx xxx"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/25 focus:border-[#E8734A] transition-all dark:text-white placeholder-gray-400 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/25 focus:border-[#E8734A] transition-all dark:text-white placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/25 focus:border-[#E8734A] transition-all dark:text-white placeholder-gray-400 shadow-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E8734A] transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: strength.level >= i ? strength.color : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold" style={{ color: strength.color }}>
                    Độ mạnh: {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full bg-gray-50 dark:bg-slate-800 border rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all dark:text-white placeholder-gray-400 shadow-sm ${
                    passwordMismatch
                      ? "border-red-400 focus:ring-red-400/20 focus:border-red-400"
                      : form.confirm && !passwordMismatch
                      ? "border-emerald-400 focus:ring-emerald-400/20 focus:border-emerald-400"
                      : "border-gray-200 dark:border-white/10 focus:ring-[#E8734A]/25 focus:border-[#E8734A]"
                  }`}
                />
                {/* Validation icon */}
                {form.confirm && (
                  <span className="absolute right-8 top-1/2 -translate-y-1/2">
                    {passwordMismatch
                      ? <XCircle className="w-4 h-4 text-red-400" />
                      : <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    }
                  </span>
                )}
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E8734A] transition">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">Mật khẩu không khớp</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-[#E8734A] cursor-pointer shrink-0"
              />
              <label htmlFor="terms" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer leading-relaxed">
                Tôi đồng ý với{" "}
                <a href="#" className="text-[#E8734A] font-semibold hover:underline">Điều khoản dịch vụ</a>
                {" "}và{" "}
                <a href="#" className="text-[#E8734A] font-semibold hover:underline">Chính sách bảo mật</a>
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
              disabled={isLoading || !agreed || passwordMismatch}
              className="w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg shadow-[#E8734A]/30 flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] hover:shadow-[#E8734A]/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed accent-gradient"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Tạo tài khoản <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-[#E8734A] font-bold hover:text-[#D4623C] transition">
              Đăng nhập
            </Link>
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-1 mt-4">
            <Sparkles className="w-3 h-3 text-[#E8734A]" />
            <span className="text-[10px] text-gray-400 font-medium">Miễn phí 14 ngày • Không cần thẻ tín dụng • Hủy bất cứ lúc nào</span>
          </div>
        </div>
      </div>
    </div>
  );
}
