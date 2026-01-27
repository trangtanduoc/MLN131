"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Playfair_Display, Roboto } from 'next/font/google';
import { Home, BookOpenText, Gamepad2, ChevronRight, RotateCcw, Play, Pause, Maximize, Minimize } from 'lucide-react';

// --- FONTS ---
const playfair = Playfair_Display({ subsets: ['latin', 'vietnamese'], weight: ['400', '600', '700'], variable: '--font-playfair' });
const roboto = Roboto({ subsets: ['latin', 'vietnamese'], weight: ['300', '400', '500', '700'], variable: '--font-roboto' });

// --- HỆ THỐNG KỊCH BẢN (STORY NODES) ---
const STORY_NODES: any = {
  start: {
    videoUrl: "/videos/MoDau.mp4",
    question: "Xã nên triển khai dồn điền đổi thửa theo định hướng nào?",
    options: [
      { label: "Mô hình triển khai theo khung kỹ thuật chuẩn hóa", nextNode: "stage1_a" },
      { label: "Mô hình triển khai theo cơ chế phối hợp đa bên", nextNode: "stage1_b" }
    ]
  },
  stage1_a: {
    videoUrl: "/videos/Option A -1.mp4",
    question: "Xử lý dịch bệnh nên theo hướng nào?",
    options: [
      { label: "Mô hình kiểm soát dịch bằng biện pháp hóa học chủ đạo", nextNode: "stage2_a" },
      { label: "Mô hình quản lý dịch tổng hợp theo hệ sinh thái", nextNode: "stage2_b" }
    ]
  },
  stage1_b: {
    videoUrl: "/videos/Option B -1.mp4",
    question: "Xử lý dịch bệnh nên theo hướng nào?",
    options: [
      { label: "Mô hình kiểm soát dịch bằng biện pháp hóa học chủ đạo", nextNode: "stage2_a" },
      { label: "Mô hình quản lý dịch tổng hợp theo hệ sinh thái", nextNode: "stage2_b" }
    ]
  },
  stage2_a: {
    videoUrl: "/videos/Option A - 2.mp4",
    question: "Làm sao để tối ưu hóa lợi nhuận?",
    options: [
      { label: "Mô hình tiêu thụ sản phẩm ở dạng nguyên liệu", nextNode: "stage3_a" },
      { label: "Mô hình phát triển sản phẩm qua chế biến và thương hiệu", nextNode: "stage3_b" }
    ]
  },
  stage2_b: {
    videoUrl: "/videos/Option B -2.mp4",
    question: "Làm sao để tối ưu hóa lợi nhuận?",
    options: [
      { label: "Mô hình tiêu thụ sản phẩm ở dạng nguyên liệu", nextNode: "stage3_a" },
      { label: "Mô hình phát triển sản phẩm qua chế biến và thương hiệu", nextNode: "stage3_b" }
    ]
  },
  stage3_a: {
    videoUrl: "/videos/Giai đoạn 3 - Option A.mp4",
    question: "Địa phương nên ưu tiên đầu tư vào hướng nào để thu hút và giữ nhân lực chất lượng cao?",
    options: [
      { label: "Mở rộng số lượng nhà máy, sản phẩm, mục đích tăng GDP", nextNode: "stage4_a" },
      { label: "Đầu tư vào năng lực tri thức và môi trường sống", nextNode: "stage4_b" }
    ]
  },
  stage3_b: {
    videoUrl: "/videos/Giai đoạn 3 - Option B.mp4",
    question: "Địa phương nên ưu tiên đầu tư vào hướng nào để thu hút và giữ nhân lực chất lượng cao?",
    options: [
      { label: "Mở rộng số lượng nhà máy, sản phẩm, mục đích tăng GDP", nextNode: "stage4_a" },
      { label: "Đầu tư vào năng lực tri thức và môi trường sống", nextNode: "stage4_b" }
    ]
  },
  stage4_a: {
    videoUrl: "/videos/Giai đoạn 4 - Option A.mp4",
    question: "Địa phương nên tổ chức bảo đảm an ninh theo hướng nào?",
    options: [
      { label: "Mô hình quản lý dựa trên kiểm soát tập trung", nextNode: "stage5_a" },
      { label: "Mô hình quản lý kết hợp cộng đồng và công nghệ", nextNode: "stage5_b" }
    ]
  },
  stage4_b: {
    videoUrl: "/videos/Giai đoạn 4 - Option B.mp4",
    question: "Địa phương nên tổ chức bảo đảm an ninh theo hướng nào?",
    options: [
      { label: "Mô hình quản lý dựa trên kiểm soát tập trung", nextNode: "stage5_a" },
      { label: "Mô hình quản lý kết hợp cộng đồng và công nghệ", nextNode: "stage5_b" }
    ]
  },
  stage5_a: {
    videoUrl: "/videos/Giai đoạn 5 - Option A.mp4",
    question: "KẾT THÚC: Bạn đã hoàn thành câu chuyện!",
    options: [
      { label: "Chơi lại từ đầu", nextNode: "start" }
    ]
  },
  stage5_b: {
    videoUrl: "/videos/Giai đoạn 5 - Option B.mp4",
    question: "KẾT THÚC: Bạn đã hoàn thành câu chuyện!",
    options: [
      { label: "Chơi lại từ đầu", nextNode: "start" }
    ]
  }
};

const InteractiveStory = () => {
  const router = useRouter();
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [showModal, setShowModal] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('/story');
  const [currentNodeKey, setCurrentNodeKey] = useState('start');
  const [showOptions, setShowOptions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");

  useEffect(() => {
    setActiveNav(pathname);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      // Tránh lỗi NaN khi total chưa sẵn sàng hoặc bằng 0
      if (total > 0 && isFinite(total)) {
        setProgress((current / total) * 100);
      }
      setCurrentTime(formatTime(current));
    }
  };

  // Hàm phát video an toàn để tránh AbortError
  const safePlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Video play interrupted:", error);
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        safePlay();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleChoice = (nextNodeKey: string) => {
    setShowOptions(false);
    setCurrentNodeKey(nextNodeKey);
    setProgress(0);
    setCurrentTime("0:00");
    
    // Chuyển cảnh nhanh: load và phát ngay lập tức
    if (videoRef.current) {
      videoRef.current.load();
      safePlay();
    }
  };

  const currentNode = STORY_NODES[currentNodeKey] || STORY_NODES['start'];

  return (
    <div className={`min-h-screen bg-[#1a1a1a] text-white ${roboto.variable} ${playfair.variable} font-sans relative`}>
      
      {/* HEADER */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b border-white/10 ${isScrolled ? 'bg-[#111111]/95 py-3 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
            <Link href="/"><span className={`text-2xl md:text-3xl font-bold uppercase tracking-widest ${playfair.className}`}>MLN131</span></Link>
            <nav className="hidden md:block">
                <ul className="flex items-center gap-8 uppercase text-xs font-bold tracking-widest">
                    <li><Link href="/" className="hover:text-[#AD9A6D] transition-colors">Trang chủ</Link></li>
                    <li><Link href="/story" className="text-[#AD9A6D]">Câu chuyện tương tác</Link></li>
                    <li><Link href="/game" className="hover:text-[#AD9A6D] transition-colors">Trò chơi ôn tập</Link></li>
                </ul>
            </nav>
        </div>
      </header>

      {/* MODAL THÔNG BÁO */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
          <div className="bg-white text-black rounded-xl p-8 max-w-lg w-full text-center border-2 border-[#AD9A6D] shadow-2xl scale-100 animate-in fade-in zoom-in duration-300">
            <h2 className={`text-2xl font-bold mb-4 uppercase text-[#AD9A6D] ${playfair.className}`}>Thông báo</h2>
            <p className="text-gray-700 mb-8 text-justify font-medium leading-relaxed">
                Sản phẩm này là sự kết tinh của trí tuệ nhân tạo, đôi lúc khó tránh khỏi những sơ suất trong vận hành, kính mong quý vị đại xá. Dẫu công nghệ có thể hạn chế, nhưng ý chí dân tộc là vĩnh cửu: <span className="font-bold text-red-600 uppercase">Hoàng Sa và Trường Sa ngàn đời nay vẫn là mảnh hồn thiêng, là phần lãnh thổ bất khả xâm phạm của nước Việt Nam ta.</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 900 600" 
                  className="w-8 h-auto inline-block ml-3 align-middle shadow-sm rounded-[2px]"
                >
                  <rect fill="#da251d" width="900" height="600"/>
                  <path fill="#ffcd00" d="M450 125 L491.34 254.19 H626.56 L517.11 333.81 L558.46 463 L450 383.38 L341.54 463 L382.89 333.81 L273.44 254.19 H408.66 Z"/>
                </svg>
            </p>
            <div className="flex flex-row gap-4 justify-center">
              <button 
                onClick={() => { setShowModal(false); safePlay(); }} 
                className="flex-1 bg-[#00C040] text-white font-bold py-3 px-4 rounded shadow-lg hover:bg-green-600 transition-all uppercase tracking-tighter sm:tracking-widest text-[10px] sm:text-xs"
              >
                Tôi đồng tình
              </button>
              <button 
                onClick={() => router.push('/')} 
                className="flex-1 bg-black text-white font-bold py-3 px-4 rounded shadow-lg hover:bg-gray-800 transition-all uppercase tracking-tighter sm:tracking-widest text-[10px] sm:text-xs"
              >
                Tôi không đồng tình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAYER SECTION */}
      <main className={`w-full min-h-screen pt-24 pb-10 px-4 md:px-10 flex flex-col items-center justify-center transition-opacity duration-500 ${showModal ? 'opacity-0' : 'opacity-100'}`}>
        
        <div ref={containerRef} className="w-full max-w-[1200px] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group">
            
            <video 
              ref={videoRef}
              onEnded={() => { setShowOptions(true); setIsPlaying(false); }}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              playsInline
            >
              <source src={currentNode.videoUrl} type="video/mp4" />
            </video>

            {/* THANH ĐIỀU KHIỂN CUSTOM */}
            <div className={`absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <input 
                  type="range" min="0" max="100" 
                  value={isNaN(progress) ? 0 : progress}
                  onChange={(e) => { 
                    if (videoRef.current && isFinite(videoRef.current.duration)) { 
                      videoRef.current.currentTime = (Number(e.target.value) * videoRef.current.duration) / 100; 
                    } 
                  }}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#AD9A6D]"
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-[#AD9A6D] transition-colors">
                            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                        </button>
                        <span className="text-xs font-mono text-gray-300">{currentTime}</span>
                    </div>
                    <button onClick={toggleFullscreen} className="text-white hover:text-[#AD9A6D] transition-colors">
                        {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                    </button>
                </div>
            </div>

            {/* OVERLAY LỰA CHỌN */}
            {showOptions && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 z-10">
                <h3 className={`text-xl md:text-3xl mb-10 text-center font-bold text-[#AD9A6D] tracking-wide max-w-2xl ${playfair.className}`}>
                  {currentNode.question}
                </h3>
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl">
                  {currentNode.options.map((option: any, index: number) => (
                    <button 
                      key={index} 
                      onClick={() => handleChoice(option.nextNode)} 
                      className="flex-1 bg-white/10 hover:bg-[#AD9A6D] border border-white/20 py-5 px-8 rounded-lg transition-all duration-300 flex items-center justify-between group shadow-xl"
                    >
                      <span className="font-bold uppercase tracking-widest text-sm md:text-base">{option.label}</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
        
        <p className="mt-8 text-gray-500 text-sm italic tracking-wide">
          * Vui lòng theo dõi hết clip để đưa ra quyết định cho hành trình tiếp theo.
        </p>
      </main>
    </div>
  );
};

export default InteractiveStory;