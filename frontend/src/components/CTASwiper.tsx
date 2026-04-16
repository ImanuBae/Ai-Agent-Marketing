"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { useTranslation } from "@/i18n/LanguageContext";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function CTASwiper() {
  const { t } = useTranslation();
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
            <div className={`${slide.className} text-center py-32 px-6 relative min-h-[460px] flex items-center justify-center`}>
              <div className="absolute inset-0 bg-black/40 z-0"></div>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-white">
                  {slide.title}
                  <br />
                  <span className="text-accent-grad">{slide.subtitle}</span>
                </h2>
                <p className="text-gray-200 max-w-lg mx-auto mb-8 font-medium">
                  {slide.desc}
                </p>
                <button className="accent-gradient px-8 py-3.5 rounded-full font-bold text-white text-lg hover:opacity-90 transition shadow-lg hover:scale-105 active:scale-95">
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
