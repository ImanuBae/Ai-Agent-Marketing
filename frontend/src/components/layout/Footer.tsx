import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/i18n/LanguageContext";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-10 grid sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image
              src="/ChatGPT Image Apr 6, 2026, 01_39_17 PM.png"
              alt="AI Marketing Agent Logo"
              width={40}
              height={40}
              className="h-10 w-auto object-contain logo-dark-fix"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("footer.description")}
          </p>
        </div>

        <div>
          <div className="font-semibold mb-3 text-sm text-gray-900 dark:text-white uppercase tracking-wider">
            {t("footer.links")}
          </div>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {[t("footer.features"), t("footer.pricing"), t("footer.blog"), t("footer.api")].map((link) => (
              <div key={link} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                {link}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-semibold mb-3 text-sm text-gray-900 dark:text-white uppercase tracking-wider">
            {t("footer.contact")}
          </div>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> hello@marketai.vn
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> 0123 456 789
            </div>
            <div className="flex gap-3 mt-4">
              {/* Facebook */}
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-700 cursor-pointer transition">
                <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
              {/* Instagram */}
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-700 cursor-pointer transition">
                <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
              {/* LinkedIn */}
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-700 cursor-pointer transition">
                <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-white/5 text-center py-4 text-xs text-gray-500 dark:text-gray-500">
        {t("footer.rights")}
      </div>
    </footer>
  );
}
