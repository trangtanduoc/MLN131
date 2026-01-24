"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
// Thay đổi: Import HomePage thay vì Game
import HomePage from "@/components/homePage" 
import IntroPage from "@/components/IntroPage" 

export default function Page() {
  // State: true = hiện Intro, false = hiện HomePage
  const [showIntro, setShowIntro] = useState(true)

  return (
    <div className="w-full h-screen overflow-hidden bg-background relative">
      <AnimatePresence mode="wait">
        
        {/* --- TRANG INTRO --- */}
        {showIntro ? (
          <motion.div
            key="intro"
            className="w-full h-full absolute inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100, transition: { duration: 0.8, ease: "easeInOut" } }}
          >
            {/* Khi bấm Start, set state thành false để ẩn Intro và hiện HomePage */}
            <IntroPage onStart={() => setShowIntro(false)} />
          </motion.div>
        ) : (
          
          /* --- TRANG HOMEPAGE (Hiển thị sau khi Intro tắt) --- */
          <motion.div
            key="homepage" // Đổi key để React nhận diện animation mới
            className="w-full h-full absolute inset-0 z-40 overflow-y-auto"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            {/* Render component HomePage ở đây */}
            <HomePage />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}