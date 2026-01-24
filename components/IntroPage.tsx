"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Playfair_Display, Montserrat } from "next/font/google";
import { motion, Variants } from "framer-motion"; 

// --- CẤU HÌNH FONT ---
const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700", "900"],
  variable: "--font-montserrat",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

// --- DANH SÁCH ẢNH ---
const images = [
  "/images/bacHo1.jpg",
  "/images/bacHo2.jpg", 
  "/images/bacHo4.jpg",
  "/images/bacHo6.jpg",
  "/images/bacHo7.jpg",
  "/images/bacHo8.jpg",
  "/images/bacHo10.jpg",
];

interface IntroProps {
  onStart: () => void;
}

export default function IntroPageModern({ onStart }: IntroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- TỰ ĐỘNG CHUYỂN ẢNH SAU 5 GIÂY ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  // --- FIX LỖI TYPESCRIPT ---
  // Khai báo rõ ràng kiểu : Variants
  const textVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.2,
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    }),
  };

  return (
    <main
      className={`relative w-full h-screen overflow-hidden bg-[#1a1a1a] ${montserrat.variable} ${playfair.variable}`}
    >
      {/* ================= BACKGROUND & SLIDESHOW (CỘT TRÁI) ================= */}
      <div className="absolute inset-0 z-0 flex">
        
        <div className="relative w-full md:w-1/2 h-full overflow-hidden bg-black">

            {images.map((src, index) => (
                <motion.div
                    key={index}
                    initial={false} 
                    animate={{ 
                        opacity: index === currentImageIndex ? 1 : 0, 
                        zIndex: index === currentImageIndex ? 10 : 0,  
                        scale: index === currentImageIndex ? 1.05 : 1 
                    }}
                    transition={{ 
                        opacity: { duration: 2.5, ease: "easeInOut" }, 
                        scale: { duration: 6, ease: "linear" }        
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    <Image
                        src={src}
                        alt={`Slide ${index}`}
                        fill
                        className="object-cover grayscale opacity-50 mix-blend-overlay"
                        priority={true} 
                    />
                    <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
                </motion.div>
            ))}
          
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none z-20"></div>
        </div>
        
        <div className="hidden md:block relative w-1/2 h-full bg-gradient-to-br from-[#2b2b2b] to-[#111111]">
            <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay"></div>
        </div>
      </div>

      {/* ================= NỘI DUNG CHÍNH (TEXT) ================= */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <div className="container mx-auto px-4 md:px-12 h-full flex items-center justify-end">
          
          <div className="w-full md:w-1/2 flex flex-col justify-center pl-0 md:pl-16">
            <motion.div initial="hidden" animate="visible" className="flex flex-col w-full">
                
                {/* 1. LIÊN MINH */}
                <motion.h1 
                    variants={textVariants} custom={1}
                    className={`text-[50px] sm:text-[70px] md:text-[80px] lg:text-[100px] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#DA251C] uppercase ${montserrat.className} drop-shadow-2xl`}
                >
                    LIÊN MINH
                </motion.h1>

                {/* 2. CÔNG - NÔNG - TRÍ */}
                <motion.div 
                    variants={textVariants} custom={2} 
                    className="flex flex-nowrap items-center gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-4 w-full overflow-visible"
                >
                    <h2 className={`text-[24px] sm:text-[32px] md:text-[45px] lg:text-[60px] leading-none font-bold text-[#DA251C] uppercase ${montserrat.className} whitespace-nowrap`}>
                        CÔNG
                    </h2>
                    <span className="h-1 w-4 sm:w-6 md:h-1.5 md:w-8 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700] flex-shrink-0"></span>
                    <h2 className={`text-[24px] sm:text-[32px] md:text-[45px] lg:text-[60px] leading-none font-bold text-[#DA251C] uppercase ${montserrat.className} whitespace-nowrap`}>
                        NÔNG
                    </h2>
                    <span className="h-1 w-4 sm:w-6 md:h-1.5 md:w-8 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700] flex-shrink-0"></span>
                    <h2 className={`text-[24px] sm:text-[32px] md:text-[45px] lg:text-[60px] leading-none font-bold text-[#DA251C] uppercase ${montserrat.className} whitespace-nowrap`}>
                        TRÍ
                    </h2>
                </motion.div>
            </motion.div>

            {/* TRÍCH DẪN */}
            <motion.div 
                variants={textVariants} custom={3}
                className="mt-8 md:mt-16 max-w-xl"
            >
                <p className={`text-lg sm:text-xl md:text-2xl leading-relaxed text-[#e0e0e0] ${playfair.className} italic border-l-4 border-[#DA251C] pl-4 md:pl-6`}>
                    “Tất cả đồng bào Việt Nam, không phân biệt gái trai, già trẻ, giàu nghèo, tôn giáo, chủng tộc, cùng nhau đoàn kết để giữ vững nền độc lập và mưu cầu hạnh phúc tự do.”
                </p>
                <p className={`text-right mt-4 md:mt-6 text-base sm:text-lg font-medium text-[#FFD700] ${montserrat.className}`}>
                    — Chủ tịch Hồ Chí Minh
                </p>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-0 left-0 w-full z-30"
      >
        <div className="w-full h-24 absolute -top-24 left-0 bg-gradient-to-t from-black/80 to-transparent z-20"></div>

        <div className="w-full bg-gradient-to-r from-[#DA251C] to-[#990000] h-20 md:h-28 flex items-center justify-between px-4 md:px-16 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/light-streak.png')] bg-cover opacity-20 mix-blend-overlay animate-pulse-slow"></div>

            {/* KHẨU HIỆU & NGÔI SAO LẬT */}
            <div className="flex items-center flex-1 z-10 overflow-hidden">
                <div className={`flex items-center gap-2 md:gap-8 text-white ${montserrat.className} font-bold tracking-widest uppercase`}>
                    <span className="text-base sm:text-xl md:text-4xl drop-shadow-md whitespace-nowrap">ĐỘC LẬP</span>
                    
                    <motion.span 
                        animate={{ rotateY: 360 }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
                        className="text-[#FFD700] text-lg md:text-3xl inline-block"
                    >★</motion.span>
                    
                    <span className="text-base sm:text-xl md:text-4xl drop-shadow-md whitespace-nowrap">TỰ DO</span>
                    
                    <motion.span 
                        animate={{ rotateY: 360 }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} 
                        className="text-[#FFD700] text-lg md:text-3xl inline-block"
                    >★</motion.span>
                    
                    <span className="text-base sm:text-xl md:text-4xl drop-shadow-md whitespace-nowrap">HẠNH PHÚC</span>
                </div>
            </div>

            {/* NÚT BẤM */}
            <div className="hidden md:block z-10">
                <button onClick={onStart} className="group relative px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] rounded-full shadow-lg hover:shadow-[#FFD700]/50 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 skew-x-12 -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out"></div>
                    <span className={`relative z-10 text-[#8B0000] text-sm md:text-lg font-black uppercase tracking-wider flex items-center gap-2 md:gap-3 ${montserrat.className}`}>
                        Bắt đầu hành trình
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </span>
                </button>
            </div>
        </div>
      </motion.div>
    </main>
  );
}