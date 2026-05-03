"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { dictionaries, Language } from "@/i18n/dictionaries";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (path: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>("vn");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("app_lang") as Language;
      if (savedLang === "vn" || savedLang === "en") {
        setLangState(savedLang);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("app_lang", newLang);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (path: string): any => {
    const keys = path.split(".");
    let current: unknown = dictionaries[lang];
    
    for (const key of keys) {
      if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[key];
      } else {
        console.warn(`Translation path not found: ${path} for language: ${lang}`);
        return path;
      }
    }
    
    return current !== undefined ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
