"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Bell, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  LogOut,
  ChevronDown
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardHeader() {
  const { user, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (pathname.includes("connections")) return "Transaction";
    if (pathname.includes("content")) return "Products";
    if (pathname.includes("trends")) return "Customers";
    if (pathname.includes("analytics")) return "Analytics";
    if (pathname.includes("schedule")) return "Schedule";
    if (pathname.includes("profile")) return "Profile";
    if (pathname.includes("security")) return "Security";
    return "Dashboard";
  };

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900 sticky top-0 z-30">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {getPageTitle()}
      </h1>

      <div className="flex items-center gap-4">
        {/* Action Icons */}
        <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition relative group">
          <MessageSquare size={18} className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#E8734A] rounded-full"></span>
        </button>
        <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition relative group">
          <Bell size={18} className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#E8734A] rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="relative ml-2" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-[24px] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            <Image 
              src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=A"} 
              alt="Avatar" 
              width={32} 
              height={32} 
              className="w-8 h-8 rounded-full border border-gray-100 dark:border-white/10" 
            />
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight">{user?.name || 'Loading...'}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{user?.email || ''}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-2 z-50 animate-fade-down origin-top-right">
              <div className="space-y-1">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 dark:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} />
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link
                  href="/dashboard/security"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 dark:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShieldCheck size={16} />
                  <span>Bảo mật</span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-bold text-[#E8734A] hover:bg-[#FDE8DF] dark:hover:bg-[#E8734A]/10 mt-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShieldAlert size={16} />
                    <span>Quản trị hệ thống</span>
                  </Link>
                )}
              </div>
              <div className="h-px bg-gray-200 dark:bg-white/10 my-1.5 mx-1" />
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm font-bold"
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
