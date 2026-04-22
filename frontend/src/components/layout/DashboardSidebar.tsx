"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  Share2, 
  ChevronLeft,
  ChevronRight,
  Search,
  Home
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: "Tổng quan", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Content AI", icon: MessageSquare, href: "/dashboard/content" },
    { name: "Market Trends", icon: TrendingUp, href: "/dashboard/trends" },
    { name: "Lịch đăng", icon: Calendar, href: "/dashboard/schedule" },
    { name: "Social Connect", icon: Share2, href: "/dashboard/social" },
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
            <span className="text-[#E8734A] dark:text-white pb-1" style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '28px' }}>
              Imanu's Lab
            </span>
          </Link>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition text-gray-500"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto no-scrollbar">
        {/* Search Bar Dummy */}
        {!isCollapsed && (
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-gray-50 dark:bg-slate-800 text-sm rounded-xl pl-9 pr-10 py-2.5 outline-none border border-transparent focus:bg-white focus:border-gray-200 focus:shadow-sm transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-medium text-gray-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded shadow-sm border border-gray-100 dark:border-white/5">⌘K</span>
            </div>
          </div>
        )}

        {/* Main Menu */}
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2 ${isCollapsed ? "text-center" : ""}`}>
            MAIN MENU
          </p>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group font-medium ${
                    isActive 
                      ? "bg-[#E8734A]/10 text-[#E8734A]" 
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon size={20} className={isActive ? "text-[#E8734A]" : "text-gray-400 group-hover:scale-110 transition-transform"} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-white/5">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#E8734A] dark:hover:text-[#E8734A]`}
          title={isCollapsed ? "Về trang chính" : ""}
        >
          <Home size={20} className="text-gray-400 group-hover:text-[#E8734A] group-hover:scale-110 transition-all" />
          {!isCollapsed && <span>Về trang chính</span>}
        </Link>
      </div>
    </aside>
  );
}
