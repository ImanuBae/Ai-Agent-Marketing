import { X, Mail, Lock, User } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "@/i18n/LanguageContext";

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register";
}

export default function AuthModals({ isOpen, onClose, type: initialType }: AuthModalsProps) {
  const { t } = useTranslation();
  const [type, setType] = useState(initialType);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${show ? "opacity-100" : "opacity-0"}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className={`relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300 ${show ? "scale-100" : "scale-95"}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition bg-transparent p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {type === "login" ? t("auth.login_title") : t("auth.register_title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {type === "login" 
              ? t("auth.login_subtitle")
              : t("auth.register_subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {type === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("auth.fullname")}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder={t("auth.fullname_placeholder")} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/20 focus:border-[#E8734A] transition-all dark:text-white" />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("auth.email")}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" placeholder="name@company.com" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/20 focus:border-[#E8734A] transition-all dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("auth.password")}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A]/20 focus:border-[#E8734A] transition-all dark:text-white" />
            </div>
            {type === "login" && (
              <div className="flex justify-end mt-1.5">
                <a href="#" className="text-xs text-[#E8734A] hover:text-[#D4623C] font-medium">{t("auth.forgot_password")}</a>
              </div>
            )}
          </div>

          <button className="w-full accent-gradient text-white rounded-lg px-4 py-2.5 text-sm font-bold shadow-md hover:opacity-90 transition mt-2">
            {type === "login" ? t("auth.login_btn") : t("auth.register_btn")}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">{t("auth.or")}</span>
            <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Google", icon: "https://www.svgrepo.com/show/475656/google-color.svg" },
              { name: "Facebook", icon: "https://www.svgrepo.com/show/475647/facebook-color.svg" }
            ].map(social => (
              <button key={social.name} className="flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition text-sm font-medium text-gray-700 dark:text-gray-300">
                <Image src={social.icon} alt={social.name} width={16} height={16} className="w-4 h-4" /> {social.name}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          {type === "login" ? t("auth.no_account") : t("auth.have_account")}{" "}
          <button 
            onClick={() => setType(type === "login" ? "register" : "login")}
            className="text-[#E8734A] font-semibold hover:text-[#D4623C] bg-transparent"
          >
            {type === "login" ? t("auth.register_link") : t("auth.login_link")}
          </button>
        </p>
      </div>
    </div>
  );
}
