"use client";

import { useState } from "react";
import { 
  Wrench, Key, Zap, Globe, Bell, ShieldCheck, 
  Eye, EyeOff, Save, CheckCircle2
} from "lucide-react";

export default function AdminSettingsPage() {
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [features, setFeatures] = useState({
    contentAI: true,
    trends: true,
    schedule: true,
    socialConnect: false,
    analytics: true,
  });
  const [settings, setSettings] = useState({
    geminiKey: "AIza••••••••••••••••••••••••••••••MK",
    geminiModel: "gemini-1.5-flash",
    maxTokensPerUser: "10000",
    rateLimitPerMin: "10",
    maintenanceMode: false,
    requireEmailVerification: false,
    maxUsersPerPlan: "100",
    defaultPlan: "free",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
          <Wrench className="text-[#E8734A]" /> Cài đặt hệ thống
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          Quản lý cấu hình AI, tính năng và bảo mật toàn hệ thống.
        </p>
      </div>

      {/* AI Configuration */}
      <section className="bg-slate-900 rounded-[28px] border border-white/5 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#E8734A]/10 flex items-center justify-center">
            <Zap className="text-[#E8734A]" size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Cấu hình Gemini AI</h2>
            <p className="text-xs text-gray-500 font-medium">Quản lý API key và model AI sử dụng trong hệ thống</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gemini API Key</label>
            <div className="relative">
              <input
                type={showGeminiKey ? "text" : "password"}
                value={settings.geminiKey}
                onChange={e => setSettings(s => ({ ...s, geminiKey: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8734A] transition pr-12 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Model AI</label>
            <select
              value={settings.geminiModel}
              onChange={e => setSettings(s => ({ ...s, geminiModel: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8734A] transition cursor-pointer"
            >
              <option value="gemini-1.5-flash">gemini-1.5-flash (Nhanh, rẻ)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Mạnh hơn)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash (Mới nhất)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Max Tokens / User / Tháng</label>
            <input
              type="number"
              value={settings.maxTokensPerUser}
              onChange={e => setSettings(s => ({ ...s, maxTokensPerUser: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8734A] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rate Limit (requests / phút)</label>
            <input
              type="number"
              value={settings.rateLimitPerMin}
              onChange={e => setSettings(s => ({ ...s, rateLimitPerMin: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8734A] transition"
            />
          </div>
        </div>
      </section>

      {/* Feature Toggles */}
      <section className="bg-slate-900 rounded-[28px] border border-white/5 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Globe className="text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Bật / tắt Tính năng</h2>
            <p className="text-xs text-gray-500 font-medium">Kiểm soát tính năng cho toàn bộ người dùng</p>
          </div>
        </div>

        <div className="space-y-4">
          {(Object.entries(features) as [string, boolean][]).map(([key, enabled]) => {
            const labels: Record<string, { label: string; desc: string }> = {
              contentAI: { label: "Content AI Creator", desc: "Cho phép người dùng generate caption/hashtag" },
              trends: { label: "Market Trends", desc: "Hiển thị bảng xu hướng từ khóa" },
              schedule: { label: "Smart Schedule", desc: "Cho phép lên lịch đăng bài" },
              socialConnect: { label: "Social Connect", desc: "Kết nối mạng xã hội qua OAuth" },
              analytics: { label: "Analytics Dashboard", desc: "Xem báo cáo hiệu suất" },
            };
            const info = labels[key];
            return (
              <div key={key} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{info.label}</p>
                  <p className="text-xs text-gray-500 font-medium">{info.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeatures(f => ({ ...f, [key]: !enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${enabled ? "bg-[#E8734A]" : "bg-white/10"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security */}
      <section className="bg-slate-900 rounded-[28px] border border-white/5 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <ShieldCheck className="text-emerald-400" size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Bảo mật & Người dùng</h2>
            <p className="text-xs text-gray-500 font-medium">Cài đặt đăng ký, xác thực và giới hạn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 flex items-center justify-between py-3 border-b border-white/5">
            <div>
              <p className="text-sm font-bold text-white">Chế độ Bảo trì</p>
              <p className="text-xs text-gray-500">Tắt toàn bộ truy cập, chỉ admin vào được</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${settings.maintenanceMode ? "bg-red-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${settings.maintenanceMode ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gói mặc định khi đăng ký</label>
            <select
              value={settings.defaultPlan}
              onChange={e => setSettings(s => ({ ...s, defaultPlan: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8734A] transition cursor-pointer"
            >
              <option value="free">Miễn phí</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Max Users (Free Plan)</label>
            <input
              type="number"
              value={settings.maxUsersPerPlan}
              onChange={e => setSettings(s => ({ ...s, maxUsersPerPlan: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8734A] transition"
            />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-slate-900 rounded-[28px] border border-white/5 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Bell className="text-amber-400" size={20} />
          </div>
          <h2 className="text-base font-black text-white">Thông báo hệ thống</h2>
        </div>
        <p className="text-xs text-gray-500 font-medium mb-6 ml-[52px]">Gửi cảnh báo tới Admin khi có sự kiện quan trọng</p>

        <div className="space-y-3">
          {[
            { label: "API Quota vượt 80%", desc: "Cảnh báo khi gần hết quota Gemini" },
            { label: "Đăng ký người dùng mới", desc: "Thông báo mỗi khi có user đăng ký" },
            { label: "Lỗi hệ thống nghiêm trọng", desc: "Gửi email khi server gặp lỗi 500" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#E8734A] cursor-pointer" />
            </div>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all ${
            saved ? "bg-emerald-500 text-white" : "accent-gradient text-white hover:opacity-90 hover:scale-[0.99] shadow-[#E8734A]/20"
          }`}
        >
          {saved ? <><CheckCircle2 size={18} /> Đã lưu!</> : <><Save size={18} /> Lưu cài đặt</>}
        </button>
      </div>
    </div>
  );
}
