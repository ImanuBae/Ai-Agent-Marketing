"use client";

import { useEffect, useState } from "react";
import { Search, Moon, Sun, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      if (savedTheme) return savedTheme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Update active nav based on scroll position
      // Order MUST match the actual visual order on the page
      const sections = ["home", "chat", "trends", "analytics", "features", "pricing", "campaigns", "reports"];
      
      // We check from bottom to top to find the first section that is near the top of the viewport
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Trigger when the section crosses the middle of the viewport
          if (rect.top <= window.innerHeight / 2) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false); // lg breakpoint
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { lang, setLang, t } = useTranslation();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleLang = () => {
    setLang(lang === "vn" ? "en" : "vn");
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(id);
      if (element) {
        const offset = 110;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }
  };

  const navItems = [
    { label: t("header.home"), id: "home" },
    { label: t("header.trends"), id: "trends" },
    { label: t("header.analytics"), id: "analytics" },
    { label: t("header.features") || "Chức năng", id: "features" },
    { label: t("header.pricing") || "Gói AI", id: "pricing" },
    { label: t("header.campaigns"), id: "campaigns" },
    { label: t("header.reports"), id: "reports" },
  ];

  return (
    <>
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-6xl z-50 transition-all duration-300 rounded-[20px] ${
          isScrolled
            ? "bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-gray-200 shadow-xl py-2 px-4 shadow-[#E8734A]/5"
            : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-100 shadow-md py-3 px-4 sm:px-6 dark:border-white/10"
        }`}
        style={{
          boxShadow: isScrolled ? "0 10px 40px -10px rgba(0,0,0,0.05)" : "none"
        }}
      >
        <div className="flex items-center justify-between gap-2 lg:gap-4 transition-all duration-300 w-full">
          
          {/* 1. Left - Logo */}
          <div className="flex-1 flex items-center justify-start transition-all duration-300">
            <span
              id="app-logo"
              className="cursor-pointer origin-left hover:opacity-90 transition-opacity text-2xl sm:text-3xl text-[#E8734A] dark:text-white px-2 whitespace-nowrap"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setActiveSection("home");
              }}
              style={{ fontFamily: '"Brush Script MT", cursive' }}
            >
              Imanu's Lab
            </span>
          </div>

          {/* 2. Center - Navigation */}
          <nav className="hidden lg:flex flex-none items-center gap-0.5 xl:gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-3 py-2 text-sm font-semibold transition-all rounded-lg ${
                  activeSection === item.id
                    ? "text-[#E8734A] bg-[#E8734A]/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* 3. Right - Actions */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
            
            {/* Lang & Theme toggles */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                aria-label="Toggle Theme"
              >
                {!mounted ? (
                  <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                ) : theme === "light" ? (
                  <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                ) : (
                  <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                )}
              </button>
              <button
                onClick={toggleLang}
                className="text-[11px] sm:text-xs font-bold text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-1.5 transition dark:bg-slate-800 dark:border-white/10 dark:text-gray-400"
              >
                {lang.toUpperCase()}
              </button>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-5 bg-gray-200 dark:bg-white/10 mx-1"></div>

            {/* User Auth state */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 pl-1">
                <Link href="/dashboard" className="flex items-center gap-2 group transition-all" title="Vào Dashboard">
                  <Image
                    src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                    alt="User avatar"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-800 shadow-sm group-hover:scale-105 transition"
                  />
                  <div className="hidden xl:block text-left">
                    <p className="text-[13px] font-black text-gray-900 dark:text-white leading-none mb-0.5">{user?.name}</p>
                    <p className="text-[9px] text-[#E8734A] font-bold uppercase tracking-widest">{t("auth.member") || "Member"}</p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition group"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm shadow-sm accent-gradient rounded-xl px-4 py-2 transition-all font-bold text-white hover:shadow-md hover:scale-[1.02] active:scale-95 tracking-wide whitespace-nowrap"
                >
                  {t("header.login")}
                </Link>
                <Link
                  href="/register"
                  className="text-sm shadow-sm accent-gradient rounded-xl px-4 py-2 transition-all font-bold text-white hover:shadow-md hover:scale-[1.02] active:scale-95 tracking-wide whitespace-nowrap"
                >
                  {t("header.register")}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-500 dark:text-gray-400 bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:border-white/10 hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-60 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div
            className="absolute top-0 right-0 h-full w-[80vw] max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col pt-[88px] px-5 pb-8 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button inner */}
            <button 
              className="absolute top-5 right-5 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Nav items */}
            <div className="space-y-1 mb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Menu chính</p>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    activeSection === item.id
                      ? "text-[#E8734A] bg-[#E8734A]/5"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-white/10 mb-6" />

               {/* Mobile search */}
               <div className="relative mb-6">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Tìm kiếm</p>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                   type="text"
                   placeholder={t("header.search")}
                   className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/30 focus:border-[#E8734A] dark:text-white placeholder-gray-400 transition-all"
                 />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Hệ thống</p>
              <div className="flex items-center justify-between px-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Giao diện</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition"
                >
                  {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  {theme === "light" ? "Sáng" : "Tối"}
                </button>
              </div>
            </div>

            {/* Auth buttons at bottom */}
            {!isAuthenticated && (
              <div className="mt-auto pt-8 space-y-3">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-[13px] flex items-center justify-center accent-gradient shadow-lg shadow-[#E8734A]/20"
                >
                  Đăng ký miễn phí
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 rounded-xl font-bold text-gray-700 dark:text-gray-300 text-[13px] flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
