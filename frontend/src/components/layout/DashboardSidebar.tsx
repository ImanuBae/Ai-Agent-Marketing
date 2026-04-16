"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  User, 
  ShieldCheck, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  ShieldAlert
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Kết nối MXH", icon: LinkIcon, href: "/dashboard/connections" },
    { name: "AI Chat", icon: MessageSquare, href: "/dashboard/content" },
    { name: "Xu hướng", icon: TrendingUp, href: "/dashboard/trends" },
    { name: "Lịch đăng bài", icon: Calendar, href: "/dashboard/schedule" },
    { name: "Báo cáo", icon: BarChart3, href: "/dashboard/analytics" },
  ];

  const accountItems = [
    { name: "Hồ sơ cá nhân", icon: User, href: "/dashboard/profile" },
    { name: "Bảo mật", icon: ShieldCheck, href: "/dashboard/security" },
  ];

  return (
    <aside 
      className={`bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-white/5 transition-all duration-300 flex flex-col z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/ChatGPT Image Apr 6, 2026, 01_39_17 PM.png" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="h-8 w-auto logo-dark-fix" 
            />
            <span className="font-black text-xl tracking-tight dark:text-white">Market<span className="text-blue-600">AI</span></span>
          </Link>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition text-gray-500"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto no-scrollbar">
        {/* Main Menu */}
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2 ${isCollapsed ? "text-center" : ""}`}>
            Menu chính
          </p>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    isActive 
                      ? "accent-gradient text-white shadow-md font-bold" 
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "group-hover:scale-110 transition-transform"} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-3 relative">
        {isAccountMenuOpen && !isCollapsed && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-2 z-50 animate-fade-up origin-bottom">
            <div className="space-y-1">
              {accountItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-semibold group ${
                      isActive 
                        ? "accent-gradient text-white" 
                        : "text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 dark:text-gray-300"
                    }`}
                  >
                    <item.icon size={16} className={isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500 transition-colors"} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 group mt-1"
                >
                  <ShieldAlert size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  <span>Quản trị hệ thống</span>
                </Link>
              )}
            </div>
            <div className="h-px bg-gray-200 dark:bg-white/10 my-1.5 mx-1" />
            <button 
              onClick={() => {
                setIsAccountMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm font-bold group"
            >
              <LogOut size={16} className="text-red-400 group-hover:translate-x-1 transition-transform" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}

        {!isCollapsed && user && (
          <div 
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            <Image 
              src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=A"} 
              alt="Avatar" 
              width={40} 
              height={40} 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside>
  );
}
