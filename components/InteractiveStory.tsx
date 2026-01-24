"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Playfair_Display, Roboto } from 'next/font/google';
import { Home, BookOpenText, Gamepad2, Search } from 'lucide-react';

// --- CẤU HÌNH FONT ---
const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
});

const roboto = Roboto({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-roboto',
});

const InteractiveStory = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  // --- STATE ---
  const [showModal, setShowModal] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('/story');

  // --- EFFECT ---
  useEffect(() => {
    setActiveNav(pathname);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- HÀM XỬ LÝ ---
  const handleAgree = () => {
    setShowModal(false);
  };

  const handleDisagree = () => {
    router.push('/'); 
  };

  const getNavClass = (path: string) => {
    const isActive = activeNav === path;
    return {
      text: isActive ? "text-[#AD9A6D]" : "text-white hover:text-[#AD9A6D]",
      line: isActive ? "w-full" : "w-0 group-hover:w-full"
    };
  };

  return (
    <div className={`min-h-screen bg-[#1a1a1a] text-white ${roboto.variable} ${playfair.variable} font-sans relative`}>
      
      {/* ================= HEADER / TASK BAR ================= */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out border-b border-white/10 ${
          isScrolled 
            ? 'bg-[#111111]/95 backdrop-blur-md py-3 shadow-lg' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
            
            {/* LOGO */}
            <div className="flex items-center gap-2 cursor-pointer">
                <Link href="/">
                    <span className={`text-2xl md:text-3xl font-bold text-white uppercase tracking-widest ${playfair.className}`}>
                        MLN131
                    </span>
                </Link>
            </div>

            {/* MENU ĐIỀU HƯỚNG */}
            <nav className="hidden md:block">
                <ul className={`flex items-center gap-8 lg:gap-10 uppercase text-xs lg:text-sm font-bold tracking-widest ${roboto.className}`}>
                    <li>
                        <Link href="/" className={`${getNavClass('/').text} transition-colors duration-300 relative group flex items-center gap-2`}>
                            <Home className="w-4 h-4 mb-0.5" />
                            Trang chủ
                            <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#AD9A6D] transition-all duration-300 ${getNavClass('/').line}`}></span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/story" className={`${getNavClass('/story').text} transition-colors duration-300 relative group flex items-center gap-2`}>
                            <BookOpenText className="w-4 h-4 mb-0.5" />
                            Câu chuyện tương tác
                            <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#AD9A6D] transition-all duration-300 ${getNavClass('/story').line}`}></span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/game" className={`${getNavClass('/game').text} transition-colors duration-300 relative group flex items-center gap-2`}>
                            <Gamepad2 className="w-4 h-4 mb-0.5" />
                            Trò chơi ôn tập
                            <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#AD9A6D] transition-all duration-300 ${getNavClass('/game').line}`}></span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
      </header>

      {/* ================= MODAL THÔNG BÁO (Đã cập nhật ICON CỜ) ================= */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
          <div className="bg-white text-black rounded-xl p-8 max-w-lg w-full shadow-2xl text-center animate-in fade-in zoom-in duration-300 border-2 border-[#AD9A6D]">
            <h2 className={`text-2xl font-bold mb-4 uppercase text-[#AD9A6D] ${playfair.className}`}>Thông báo</h2>
            
            <p className="text-gray-700 mb-8 leading-relaxed text-justify font-medium">
             Sản phẩm này là sự kết tinh của trí tuệ nhân tạo, đôi lúc khó tránh khỏi những sơ suất trong vận hành, kính mong quý vị đại xá. Dẫu công nghệ có thể hạn chế, nhưng ý chí dân tộc là vĩnh cửu: <span className="font-bold text-red-600 uppercase">Hoàng Sa và Trường Sa ngàn đời nay vẫn là mảnh hồn thiêng, là phần lãnh thổ bất khả xâm phạm của nước Việt Nam ta.</span>
              
              {/* --- ICON CỜ VIỆT NAM SVG --- */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 900 600" 
                className="w-8 h-auto inline-block ml-3 align-middle shadow-sm rounded-[2px]"
                aria-label="Cờ Việt Nam"
              >
                <rect fill="#da251d" width="900" height="600"/>
                <path fill="#ffcd00" d="M450 125 L491.34 254.19 H626.56 L517.11 333.81 L558.46 463 L450 383.38 L341.54 463 L382.89 333.81 L273.44 254.19 H408.66 Z"/>
              </svg>
              {/* --------------------------- */}

            </p>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleAgree}
                className="bg-[#00C040] hover:bg-[#00a035] text-white font-bold py-2 px-6 rounded transition-colors shadow-lg"
              >
                Tôi đồng tình
              </button>
              
              <button 
                onClick={handleDisagree}
                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded transition-colors shadow-lg"
              >
                Tôi không đồng tình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIDEO PLAYER ================= */}
      <main className={`w-full min-h-screen pt-24 pb-10 px-4 md:px-10 flex flex-col items-center justify-center transition-opacity duration-500 ${showModal ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        <div className="w-full max-w-[1200px] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
            <iframe 
                src="https://player.stornaway.io/watch/b91b019d" 
                className="absolute top-0 left-0 w-full h-full"
                allow="autoplay; fullscreen; interactive; gyroscope; accelerometer; encrypted-media"
                allowFullScreen
                title="Interactive Story Player"
            ></iframe>
        </div>

        <p className="mt-6 text-gray-400 text-sm italic">
           * Hãy tương tác trực tiếp trên video để lựa chọn hướng đi của câu chuyện.
        </p>

      </main>

    </div>
  );
};

export default InteractiveStory;