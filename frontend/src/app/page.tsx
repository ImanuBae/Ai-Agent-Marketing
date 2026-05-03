"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Hero from "@/components/landing/Hero";
import TrendingCards from "@/components/landing/TrendingCards";
import CategoryTags from "@/components/landing/CategoryTags";
import Analytics from "@/components/landing/Analytics";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import CTASwiper from "@/components/landing/CTASwiper";
import Footer from "@/components/layout/Footer";
import AuthModals from "@/components/auth/AuthModals";
import AIChatFloating from "@/components/shared/AIChatFloating";

export default function Home() {
  const [authModal, setAuthModal] = useState<{ open: boolean; type: "login" | "register" }>({
    open: false,
    type: "login",
  });

  return (
    <div className="h-full w-full grad-bg text-gray-900 overflow-auto dark:bg-slate-950 transition-colors">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 pt-16 sm:pt-20 lg:pt-20 pb-4 space-y-6">
        <Hero />
        <TrendingCards />
        <CategoryTags />
        <Analytics />
        <Features />
        <Pricing />
        <CTASwiper />
      </main>

      <AIChatFloating />

      <Footer />

      <AuthModals 
        isOpen={authModal.open} 
        onClose={() => setAuthModal({ ...authModal, open: false })} 
        type={authModal.type} 
      />
    </div>
  );
}
