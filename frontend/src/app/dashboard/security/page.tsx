"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function SecurityPage() {
  const { changePassword } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false });
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const toggleShow = (key: keyof typeof showPass) => {
    setShowPass({ ...showPass, [key]: !showPass[key] });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    if (form.next !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (form.next.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(form.current, form.next);
      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
    } catch {
      setError("Mật khẩu hiện tại không chính xác");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Bảo mật & Mật khẩu</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Bảo vệ tài khoản và cập nhật mật khẩu của bạn</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8">
        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-xl border border-gray-100 dark:border-white/5 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Lock size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Đổi mật khẩu</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-6 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 ml-1">Mật khẩu hiện tại</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showPass.current ? "text" : "password"} 
                  value={form.current}
                  onChange={(e) => setForm({...form, current: e.target.value})}
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                />
                <button type="button" onClick={() => toggleShow("current")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 ml-1">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showPass.next ? "text" : "password"} 
                  value={form.next}
                  onChange={(e) => setForm({...form, next: e.target.value})}
                  required
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                />
                <button type="button" onClick={() => toggleShow("next")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPass.next ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 ml-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showPass.confirm ? "text" : "password"} 
                  value={form.confirm}
                  onChange={(e) => setForm({...form, confirm: e.target.value})}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                />
                <button type="button" onClick={() => toggleShow("confirm")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-100 dark:border-red-500/20">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                <CheckCircle2 size={18} />
                Đổi mật khẩu thành công!
              </div>
            )}

            <button 
              type="submit"
              disabled={isSaving}
              className="accent-gradient text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ShieldCheck size={18} />
              )}
              Cập nhật mật khẩu
            </button>
          </form>
        </div>

        {/* Security Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
            <Shield className="w-12 h-12 text-blue-400 mb-6" />
            <h4 className="text-lg font-bold mb-3 tracking-snug">Lời khuyên bảo mật</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                Mật khẩu nên có tối thiểu 8 ký tự, bao gồm cả chữ hoa, chữ thường và số.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                Không nên sử dụng mật khẩu cũ hoặc mật khẩu dễ đoán.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                Bật xác thực 2 lớp (2FA) để tăng cường bảo mật (Sắp ra mắt).
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-white/5">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Hoạt động gần đây</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Đăng nhập thành công</p>
                  <p className="text-[10px] text-gray-500">Hôm nay, 14:20 • Chrome on Windows</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Cập nhật hồ sơ</p>
                  <p className="text-[10px] text-gray-500">Hôm qua, 09:12 • Chrome on Windows</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
