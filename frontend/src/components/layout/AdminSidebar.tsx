"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Settings, 
  Activity, 
  ShieldCheck, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Database,
  FileText,
  Wrench
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
    { name: "Người dùng", icon: Users, href: "/admin/users" },
    { name: "Nội dung AI", icon: FileText, href: "/admin/content" },
    { name: "Hệ thống", icon: Activity, href: "/admin/system" },
    { name: "Cài đặt", icon: Wrench, href: "/admin/settings" },
    { name: "Logs hệ thống", icon: Database, href: "/admin/logs" },
  ];

  return (
    <aside 
      className={`bg-slate-900 border-r border-white/5 transition-all duration-300 flex flex-col z-40 text-gray-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Admin Branding */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center font-black text-white">
              A
            </div>
            <div>
              <p className="font-black text-sm text-white leading-none">Admin Panel</p>
              <p className="text-[10px] text-[#E8734A] font-bold uppercase tracking-wider mt-1">Ai-Agent</p>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition text-gray-400"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto no-scrollbar">
        {/* Management Section */}
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 px-2 ${isCollapsed ? "text-center" : ""}`}>
            Quản lý
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
                      ? "accent-gradient text-white shadow-lg shadow-[#E8734A]/20 font-bold" 
                      : "hover:bg-white/5 hover:text-white text-gray-400"
                  }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "text-gray-500 group-hover:text-[#E8734A] transition-colors"} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Health Section */}
        {!isCollapsed && (
          <div className="px-2">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase">System Health</p>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span>Server Status</span>
                  <span className="text-green-400">Stable</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-[#E8734A]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {!isCollapsed && (
          <Link 
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all text-sm font-semibold"
          >
            <ShieldCheck size={18} />
            <span>Về Dashboard User</span>
          </Link>
        )}
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group"
          title={isCollapsed ? "Đăng xuất" : ""}
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          {!isCollapsed && <span className="font-bold">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
