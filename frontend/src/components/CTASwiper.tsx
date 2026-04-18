"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { useTranslation } from "@/i18n/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function CTASwiper() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const ctaData = t("cta.items") as unknown as { title: string, subtitle: string, desc: string, btnText: string }[];

  const slides = [
    {
      title: ctaData[0].title,
      subtitle: ctaData[0].subtitle,
      desc: ctaData[0].desc,
      btnText: ctaData[0].btnText,
      className: "cta-slide-1",
    },
    {
      title: ctaData[1].title,
      subtitle: ctaData[1].subtitle,
      desc: ctaData[1].desc,
      btnText: ctaData[1].btnText,
      className: "cta-slide-2",
    },
    {
      title: ctaData[2].title,
      subtitle: ctaData[2].subtitle,
      desc: ctaData[2].desc,
      btnText: ctaData[2].btnText,
      className: "cta-slide-3",
    },
  ];

  return (
    <section id="campaigns" className="fade-up fade-up-d5 max-w-[1400px] mx-auto py-6 px-4">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="cta-swiper overflow-hidden rounded-[40px] shadow-2xl"
      >
        {slides.map((slide, i) => (
        <SwiperSlide key={i}>
            <div className="text-center py-32 px-6 relative min-h-[460px] flex items-center justify-center bg-gray-50 dark:bg-slate-900 overflow-hidden">
              <div className="absolute inset-0 bg-[#E8734A]/5 blur-3xl rounded-full scale-150"></div>
              <div className="relative z-10 p-8 rounded-[40px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-[#E8734A]/20 dark:border-white/5 shadow-xl max-w-3xl w-full">
                <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">
                  {slide.title}
                  <br />
                  <span className="text-[#E8734A]">{slide.subtitle}</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-10 font-medium text-lg leading-relaxed">
                  {slide.desc}
                </p>
                <button 
                  onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
                  className="accent-gradient px-8 py-3.5 rounded-full font-bold text-white text-lg hover:opacity-90 transition shadow-lg hover:scale-105 active:scale-95"
                >
                  {slide.btnText}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
