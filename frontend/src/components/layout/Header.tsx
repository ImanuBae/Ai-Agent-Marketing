"use client";

import { useEffect, useState } from "react";
import { Search, Moon, Sun, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/i18n/LanguageContext";
import { useAuth } from "@/context/AuthContext";

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
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [theme]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
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
    { label: t("header.chat"), id: "chat" },
    { label: t("header.trends"), id: "trends" },
    { label: t("header.campaigns"), id: "campaigns" },
    { label: t("header.analytics"), id: "analytics" },
    { label: t("header.reports"), id: "reports" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#FEFAF7]/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-[#E8734A]/20 dark:border-white/10 shadow-md py-1"
            : "bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-b border-white/50 dark:border-white/10 shadow-sm py-2"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-3 transition-all duration-300">
          {/* Logo */}
          <div className={`flex items-center shrink-0 transition-all duration-300 ${isScrolled ? "scale-90" : "scale-100"}`}>
            <Image
              id="app-logo"
              src="/ChatGPT Image Apr 6, 2026, 01_39_17 PM.png"
              alt="AI Marketing Agent Logo"
              width={120}
              height={90}
              priority
              className={`w-auto object-contain cursor-pointer origin-left logo-multiply logo-dark-fix transition-all ${
                isScrolled ? "h-12 sm:h-16 md:h-20" : "h-14 sm:h-20 md:h-24"
              } hover:scale-105`}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setActiveSection("home");
              }}
            />
          </div>

          {/* Search — desktop only */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder={t("header.search")}
                className={`w-full bg-gray-50/50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:border-[#E8734A] focus:bg-white dark:focus:bg-white/20 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 transition-all font-medium ${
                  isScrolled ? "py-2" : "py-2.5"
                }`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              {!mounted ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : theme === "light" ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Lang toggle — hidden on very small screens */}
            <button
              onClick={toggleLang}
              className="hidden xs:block text-xs font-semibold bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 hover:bg-gray-50 transition text-gray-700 shadow-sm dark:bg-slate-800 dark:border-white/10 dark:text-gray-300"
            >
              {lang.toUpperCase()}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-4 pl-2 border-l border-gray-200 dark:border-white/10 ml-1">
                <Link href="/dashboard" className="flex items-center gap-2 group transition-all" title="Vào Dashboard">
                  <Image
                    src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                    alt="User avatar"
                    width={36}
                    height={36}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md group-hover:scale-110 transition"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-0.5">{user?.name}</p>
                    <p className="text-[10px] text-[#E8734A] font-bold uppercase tracking-wider">{t("auth.member") || "Member"}</p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition group"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-xs sm:text-sm shadow-md accent-gradient rounded-full px-4 sm:px-6 transition-all font-bold text-white hover:shadow-lg hover:opacity-90 tracking-wide ${
                    isScrolled ? "py-1.5 sm:py-2" : "py-2 sm:py-2.5"
                  }`}
                >
                  {t("header.login")}
                </Link>
                <Link
                  href="/register"
                  className={`text-xs sm:text-sm shadow-md accent-gradient rounded-full px-4 sm:px-6 transition-all font-bold text-white hover:shadow-lg hover:opacity-90 tracking-wide hidden sm:block ${
                    isScrolled ? "py-1.5 sm:py-2" : "py-2 sm:py-2.5"
                  }`}
                >
                  {t("header.register")}
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* NAV — desktop */}
        <nav
          className={`max-w-7xl mx-auto px-4 hidden sm:flex gap-1 justify-center overflow-x-auto text-sm border-t border-gray-100 dark:border-white/5 no-scrollbar transition-all duration-300 ${
            isScrolled ? "py-1 opacity-90 scale-95" : "py-1.5 opacity-100 scale-100"
          }`}
          id="main-nav"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`${
                activeSection === item.id
                  ? "accent-gradient text-white shadow-md active-nav"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
              } px-4 py-1.5 whitespace-nowrap font-semibold transition-all rounded-full text-xs sm:text-sm`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div
            className="absolute top-0 right-0 h-full w-[75vw] max-w-[300px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col pt-20 px-4 pb-8 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile search */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("header.search")}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/30 focus:border-[#E8734A] dark:text-white placeholder-gray-400 transition-all"
              />
            </div>

            {/* Nav items */}
            <div className="space-y-1 mb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Menu</p>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    activeSection === item.id
                      ? "accent-gradient text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-white/10 mb-5" />

            {/* Settings */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Cài đặt</p>
              <div className="flex items-center justify-between px-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Giao diện</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition"
                >
                  {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {theme === "light" ? "Tối" : "Sáng"}
                </button>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Ngôn ngữ</span>
                <button
                  onClick={toggleLang}
                  className="text-xs font-bold bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition"
                >
                  {lang.toUpperCase()}
                </button>
              </div>
            </div>

            {/* Auth buttons at bottom */}
            {!isAuthenticated && (
              <div className="mt-auto pt-6 space-y-2">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center accent-gradient shadow-lg shadow-[#E8734A]/20"
                >
                  Đăng ký miễn phí
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 text-sm flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-white/5 transition"
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
