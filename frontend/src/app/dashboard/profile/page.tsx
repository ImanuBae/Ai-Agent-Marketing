"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import Image from "next/image";
import { Camera, User, Mail, Phone, Briefcase, MapPin, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    businessName: user?.businessInfo?.name || "",
    businessField: user?.businessInfo?.field || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        businessInfo: {
          name: form.businessName,
          field: form.businessField,
        }
      });
      alert("Cập nhật thông tin thành công!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview ngay lập tức
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    const formData = new FormData();
    formData.append("avatar", file);

    setIsUploadingAvatar(true);
    try {
      const response = await api.post("users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data?.success) {
        await updateProfile(response.data.data);
      }
    } catch {
      setAvatarPreview(null);
      alert("Upload avatar thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploadingAvatar(false);
      // Reset input để có thể chọn lại cùng file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const currentAvatar =
    avatarPreview ||
    user?.avatar ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=A";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Quản lý thông tin cá nhân và doanh nghiệp của bạn</p>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        {/* Left - Avatar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-white/5 text-center">
            <div className="relative inline-block group mb-4">
              <Image
                src={currentAvatar}
                alt="Avatar"
                width={128}
                height={128}
                className="w-32 h-32 rounded-full border-4 border-blue-500/20 shadow-lg object-cover"
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition group-hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUploadingAvatar ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</h3>
            <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Nhấn vào biểu tượng camera để đổi ảnh</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black uppercase rounded-full">
                Professional Plan
              </span>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-xl border border-gray-100 dark:border-white/5">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 ml-1">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 ml-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="Chưa cập nhật"
                    pattern="[0-9]{10,11}"
                    title="Số điện thoại phải có 10-11 chữ số"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 ml-1">Tên doanh nghiệp</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm({...form, businessName: e.target.value})}
                    placeholder="Ví dụ: MarketAI Agency"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 ml-1">Lĩnh vực hoạt động</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={form.businessField}
                    onChange={(e) => setForm({...form, businessField: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white appearance-none"
                  >
                    <option value="">Chọn lĩnh vực</option>
                    <option value="Technology">Công nghệ</option>
                    <option value="Fashion">Thời trang</option>
                    <option value="Food & Beverage">Thực phẩm & Đồ uống</option>
                    <option value="Beauty">Làm đẹp</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="accent-gradient text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2 group active:scale-95 disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} className="group-hover:rotate-12 transition-transform" />
                )}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
