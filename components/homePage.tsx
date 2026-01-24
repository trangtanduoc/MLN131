"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
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

// --- HELPER COMPONENT ---
const SectionLabel = ({ number, title }: { number: string; title: string }) => (
  <div className="mb-4">
    <span className={`text-[#AD9A6D] text-sm font-bold tracking-[1px] uppercase block ${roboto.className}`}>
      {number} {title}
    </span>
  </div>
);

// --- DỮ LIỆU: ĐỊNH NGHĨA ---
const definitionsData = [
  {
    id: 1,
    title: "1. Giai cấp công nhân",
    content: "Là những người lao động trong lĩnh vực công nghiệp, dịch vụ công nghiệp, làm việc chủ yếu bằng lao động trí óc hoặc chân tay...",
    role: "Họ giữ vai trò quan trọng trong quá trình sản xuất công nghiệp và hiện đại hóa.",
    image: "/images/bacHo3.webp",
    order: "normal"
  },
  {
    id: 2,
    title: "2. Giai cấp nông dân",
    content: "Là những người lao động trong lĩnh vực nông nghiệp, lâm nghiệp, ngư nghiệp, gắn bó với đất đai...",
    role: "Họ là lực lượng chủ yếu trong sản xuất lương thực, thực phẩm và ổn định xã hội nông thôn.",
    image: "/images/bacHo5.webp",
    order: "reverse"
  },
  {
    id: 3,
    title: "3. Tầng lớp trí thức",
    content: "Là những người lao động trí óc có trình độ học vấn và chuyên môn cao...",
    role: "Họ đóng vai trò quan trọng trong sáng tạo tri thức, khoa học – công nghệ và phát triển xã hội.",
    image: "/images/BacHo4.jpg",
    order: "normal"
  },
];

// --- DỮ LIỆU: THÁCH THỨC ---
const challengesData = [
  {
    id: 1,
    title: "Cơ cấu xã hội thay đổi",
    content: "Lực lượng công nhân chuyển dịch mạnh sang khu vực dịch vụ, công nghệ cao; nông dân giảm về số lượng..."
  },
  {
    id: 2,
    title: "Chênh lệch thu nhập và cơ hội",
    content: "Khoảng cách giữa nông thôn – thành thị, giữa công nhân – trí thức..."
  },
  {
    id: 3,
    title: "Tác động của toàn cầu hóa & 4.0",
    content: "Đòi hỏi công nhân và nông dân phải được đào tạo lại..."
  },
  {
    id: 4,
    title: "Yêu cầu đổi mới chính sách",
    content: "Cần có cơ chế phối hợp thực chất hơn..."
  }
];

export default function HomePage() {
  
  const [openChallenge, setOpenChallenge] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- LOGIC HIGHLIGHT MENU ---
  const pathname = usePathname(); 
  const [activeNav, setActiveNav] = useState('/'); 

  // Tự động nhận diện trang
  useEffect(() => {
    setActiveNav(pathname);
  }, [pathname]);

  const getNavClass = (path: string) => {
    const isActive = activeNav === path;
    return {
      text: isActive ? "text-[#AD9A6D]" : "text-white hover:text-[#AD9A6D]",
      line: isActive ? "w-full" : "w-0 group-hover:w-full"
    };
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleChallenge = (id: number) => {
    setOpenChallenge(openChallenge === id ? null : id);
  };

  return (
    <div className={`bg-[#111111] text-[#b5aca3] w-full overflow-hidden ${roboto.variable} ${playfair.variable} font-sans relative`}>
      
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
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveNav('/')}>
                <Link href="/">
                    <span className={`text-2xl md:text-3xl font-bold text-white uppercase tracking-widest ${playfair.className}`}>
                        MLN131
                    </span>
                </Link>
            </div>

            {/* MENU ĐIỀU HƯỚNG */}
            <nav className="hidden md:block">
                <ul className={`flex items-center gap-8 lg:gap-10 uppercase text-xs lg:text-sm font-bold tracking-widest ${roboto.className}`}>
                    
                    {/* 1. Trang chủ */}
                    <li>
                        <Link 
                            href="/" 
                            onClick={() => setActiveNav('/')}
                            className={`${getNavClass('/').text} transition-colors duration-300 relative group flex items-center gap-2`}
                        >
                            <Home className="w-4 h-4 mb-0.5" />
                            Trang chủ
                            <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#AD9A6D] transition-all duration-300 ${getNavClass('/').line}`}></span>
                        </Link>
                    </li>

                    {/* 2. Câu chuyện tương tác (Link sang /story) */}
                    <li>
                        <Link 
                            href="/story" 
                            onClick={() => setActiveNav('/story')}
                            className={`${getNavClass('/story').text} transition-colors duration-300 relative group flex items-center gap-2`}
                        >
                            <BookOpenText className="w-4 h-4 mb-0.5" />
                            Câu chuyện tương tác
                            <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#AD9A6D] transition-all duration-300 ${getNavClass('/story').line}`}></span>
                        </Link>
                    </li>

                    {/* 3. Trò chơi ôn tập (Link sang /game) */}
                    <li>
                        <Link 
                            href="/game" 
                            onClick={() => setActiveNav('/game')}
                            className={`${getNavClass('/game').text} transition-colors duration-300 relative group flex items-center gap-2`}
                        >
                            <Gamepad2 className="w-4 h-4 mb-0.5" />
                            Trò chơi ôn tập
                            <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#AD9A6D] transition-all duration-300 ${getNavClass('/game').line}`}></span>
                        </Link>
                    </li>

                </ul>
            </nav>

        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full h-screen flex items-center justify-start">
        <div className="absolute inset-0 z-0">
          <Image src="/images/bacHo1.jpg" alt="Hero" fill className="object-cover object-center opacity-80" priority />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-16">
          <div className="max-w-4xl text-left">
            <span className={`text-[#AD9A6D] text-xs md:text-sm font-bold tracking-[4px] uppercase block mb-4 ${roboto.className}`}>
              CHƯƠNG 5:
            </span>
            <h1 className={`text-2xl md:text-4xl lg:text-5xl text-white font-bold leading-tight drop-shadow-2xl uppercase ${playfair.className}`}>
              CƠ CẤU XÃ HỘI – GIAI CẤP <br />
              <span className="block my-2 text-[#b5aca3]">VÀ</span> 
              LIÊN MINH GIAI CẤP, TẦNG LỚP
            </h1>
          </div>
        </div>
      </section>

      {/* ================= 01. ĐỊNH NGHĨA ================= */}
      <section className="bg-[#F4EFE4] text-[#111111] py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
             <SectionLabel number="01" title="Định Nghĩa" />
             <h2 className={`text-3xl md:text-5xl text-[#111111] leading-tight font-bold ${playfair.className}`}>
               Ba lực lượng nòng cốt
             </h2>
             <div className="w-20 h-1 bg-[#AD9A6D] mx-auto mt-6"></div>
          </div>

          <div className="space-y-24">
            {definitionsData.map((item) => (
              <div 
                key={item.id} 
                className={`flex flex-col md:flex-row items-center gap-12 md:gap-20 ${
                  item.order === 'reverse' ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="w-full md:w-1/2 space-y-6">
                   <h3 className={`text-3xl md:text-4xl text-[#AD9A6D] font-bold ${playfair.className}`}>
                     {item.title}
                   </h3>
                   <p className="text-lg text-[#54595F] leading-relaxed text-justify">
                     {item.content}
                   </p>
                   <div className="bg-white p-5 border-l-4 border-[#AD9A6D] rounded-r-lg shadow-sm">
                      <p className="italic text-[#111111] font-medium">→ {item.role}</p>
                   </div>
                </div>

                <div className="w-full md:w-1/2 relative h-[350px] md:h-[450px] group">
                   <div className="absolute inset-0 bg-[#AD9A6D] rounded-lg transform translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300"></div>
                   <div className="relative h-full w-full rounded-lg overflow-hidden shadow-2xl">
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                   </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 py-60 px-12 bg-[#1a1a1a] text-center rounded-lg shadow-xl relative overflow-hidden group">
              <div className="relative z-10 max-w-4xl mx-auto"> 
                <h4 className={`text-2xl md:text-4xl text-white italic leading-relaxed ${playfair.className}`}>
                  "Công – nông – trí là ba lực lượng nòng cốt của xã hội, có mối quan hệ gắn bó, bổ sung cho nhau trong sự nghiệp xây dựng và phát triển đất nước."
                </h4>
              </div>
              <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                  <Image 
                     src="/images/bacHo2.jpg" 
                     alt="Background Khai Quat" 
                     fill 
                     className="object-cover object-center grayscale" 
                  />
              </div>
          </div>
        </div>
      </section>

      {/* ================= 03. THÁCH THỨC ================= */}
      <section className="bg-[#fffcf5] py-24 md:py-32 text-[#111111]">
        <div className="container mx-auto px-6 md:px-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
               <div>
                  <SectionLabel number="03" title="Thách Thức & Đổi Mới" />
                  <h2 className={`text-4xl md:text-5xl text-[#111111] mb-8 font-bold leading-tight ${playfair.className}`}>
                    Yêu cầu đổi mới trong bối cảnh hiện nay
                  </h2>
                  <p className="text-lg text-[#54595F] mb-8 text-justify">
                    Trong bối cảnh phát triển kinh tế thị trường định hướng xã hội chủ nghĩa và hội nhập quốc tế, liên minh công – nông – trí thức đang đối mặt nhiều thách thức. Bấm vào bên phải để xem chi tiết.
                  </p>
                  <div className="relative h-[300px] w-full rounded-lg overflow-hidden shadow-2xl">
                      <Image src="/images/bacHo6.jpg" alt="Thach thuc" fill className="object-cover" />
                  </div>
               </div>

               <div className="space-y-4">
                  {challengesData.map((item) => (
                    <div key={item.id} className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                       <button 
                          onClick={() => toggleChallenge(item.id)}
                          className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors text-left"
                       >
                          <span className={`text-lg font-bold text-[#111111] ${playfair.className}`}>
                            {item.title}
                          </span>
                          <span className="text-[#AD9A6D] text-2xl font-bold">
                             {openChallenge === item.id ? '−' : '+'}
                          </span>
                       </button>
                       <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          openChallenge === item.id ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                       }`}>
                          <div className="p-5 pt-0 text-[#54595F] text-base leading-relaxed border-t border-gray-100 mt-2">
                             {item.content}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="mt-24 text-center max-w-4xl mx-auto">
               <div className="w-16 h-1 bg-[#AD9A6D] mx-auto mb-8"></div>
               <h3 className={`text-3xl md:text-4xl text-[#111111] mb-6 italic ${playfair.className}`}>
                 Lời kết
               </h3>
               <p className="text-lg text-[#54595F] leading-relaxed">
                 "Liên minh công – nông – trí thức ở Việt Nam hiện nay vừa là nền tảng chính trị, vừa là động lực phát triển xã hội. Tuy nhiên, để phát huy hiệu quả, cần làm mới nội dung, hình thức gắn kết và chính sách phù hợp với điều kiện kinh tế thị trường và thời đại công nghệ số."
               </p>
            </div>

        </div>
      </section>

    </div>
  );
}