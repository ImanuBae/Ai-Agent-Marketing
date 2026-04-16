"use client";

import { useEffect, useState } from "react";
import { Search, Moon, Sun, LogOut } from "lucide-react";
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

  const navItems = [
    { label: t("header.home"), id: "home" },
    { label: t("header.chat"), id: "chat" },
    { label: t("header.trends"), id: "trends" },
    { label: t("header.campaigns"), id: "campaigns" },
    { label: t("header.analytics"), id: "analytics" },
    { label: t("header.reports"), id: "reports" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-black/5 shadow-sm py-1" 
          : "bg-white dark:bg-slate-900 py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-6 transition-all duration-300">
        {/* Logo */}
        <div className={`flex items-center shrink-0 pl-2 transition-all duration-300 ${isScrolled ? "scale-90" : "scale-100"}`}>
          <Image
            id="app-logo"
            src="/ChatGPT Image Apr 6, 2026, 01_39_17 PM.png"
            alt="AI Marketing Agent Logo"
            width={120}
            height={90}
            className={`w-auto object-contain cursor-pointer origin-left logo-multiply logo-dark-fix transition-all ${
              isScrolled ? "h-16 md:h-20" : "h-20 md:h-24"
            } hover:scale-105`}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setActiveSection("home");
            }}
          />
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder={t("header.search")}
              className={`w-full bg-gray-50/50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:border-blue-400 focus:bg-white dark:focus:bg-white/20 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 transition-all font-medium ${
                isScrolled ? "py-2" : "py-2.5"
              }`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            {!mounted ? (
              <Moon className="w-5 h-5" />
            ) : theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <button 
            onClick={toggleLang}
            className="text-xs font-semibold bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition text-gray-700 shadow-sm dark:bg-slate-800 dark:border-white/10 dark:text-gray-300"
          >
            {lang.toUpperCase()}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-4 pl-2 border-l border-gray-200 dark:border-white/10 ml-1">
              <Link href="/dashboard" className="flex items-center gap-2 group transition-all" title="Vào Dashboard">
                <Image 
                  src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                  alt="User avatar" 
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md group-hover:scale-110 transition"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-0.5">{user?.name}</p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{t("auth.member") || "Member"}</p>
                </div>
              </Link>
              <button 
                onClick={logout}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition group"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm shadow-md accent-gradient rounded-full px-6 transition-all font-bold text-white hover:shadow-lg hover:opacity-90 tracking-wide ${
                    isScrolled ? "py-2" : "py-2.5"
                }`}
              >
                {t("header.login")}
              </Link>
              <Link
                href="/register"
                className={`text-sm shadow-md accent-gradient rounded-full px-6 transition-all font-bold text-white hover:shadow-lg hover:opacity-90 tracking-wide hidden sm:block ${
                    isScrolled ? "py-2" : "py-2.5"
                }`}
              >
                {t("header.register")}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* NAV */}
      <nav
        className={`max-w-7xl mx-auto px-4 flex gap-1 justify-center overflow-x-auto text-sm border-t border-gray-100 dark:border-white/5 no-scrollbar transition-all duration-300 ${
            isScrolled ? "py-1 opacity-90 scale-95" : "py-1.5 opacity-100 scale-100"
        }`}
        id="main-nav"
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id);
              if (item.id === "home") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                const element = document.getElementById(item.id);
                if (element) {
                  const offset = 140; // Approximate header height
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - offset;
                  
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                  });
                }
              }
            }}
            className={`${
              activeSection === item.id
                ? "accent-gradient text-white shadow-md active-nav"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
            } px-5 py-1.5 whitespace-nowrap font-semibold transition-all rounded-full`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
