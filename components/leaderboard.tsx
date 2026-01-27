"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

type Player = {
  id?: string;
  name: string;
  score: number;
};

export function Leaderboard({
  players,
  currentPlayerId,
}: {
  players: Player[];
  currentPlayerId?: string | null;
}) {
  // sort theo điểm giảm dần
  const sorted = [...players].sort((a, b) => b.score - a.score);

  // tính rank (xử lý đồng hạng)
  let lastScore: number | null = null;
  let lastRank = 0;

  const ranked = sorted.map((p, index) => {
    const rank = p.score === lastScore ? lastRank : index + 1;
    lastScore = p.score;
    lastRank = rank;
    return { ...p, rank };
  });

  return (
    <Card className="border-4 border-yellow-600 shadow-2xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-black drop-shadow">🏆 BẢNG XẾP HẠNG VÀNG 🏆</CardTitle>
        <p className="text-sm text-white/90 mt-1">Những chiến binh hàng đầu trong cuộc chinh phục lịch sử</p>
      </CardHeader>

      <CardContent className="space-y-2 max-h-96 overflow-y-auto p-4">
        <AnimatePresence>
          {ranked.map((p) => {
            const isMe = p.id === currentPlayerId;

            return (
              <motion.div
                key={p.id || p.name}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "flex justify-between items-center px-5 py-4 rounded-lg transition-all duration-200 border-2 font-bold",
                  // Top 3 styling với màu sắc nổi bật
                  p.rank === 1 && "bg-yellow-300 dark:bg-yellow-600 border-yellow-500 dark:border-yellow-400 shadow-lg scale-105",
                  p.rank === 2 && "bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-400 shadow-md",
                  p.rank === 3 && "bg-orange-300 dark:bg-orange-600 border-orange-400 dark:border-orange-400 shadow-md",
                  p.rank > 3 && "bg-amber-100 dark:bg-amber-900 border-amber-400 dark:border-amber-600 hover:bg-amber-200 dark:hover:bg-amber-800",
                  // Highlight người chơi hiện tại
                  isMe && "ring-4 ring-red-500 ring-offset-2"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black">
                    {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}
                  </span>
                  <span className={cn("font-bold text-lg", isMe ? "text-red-600 dark:text-red-400" : "text-amber-900 dark:text-amber-100")}>
                    {p.name} {isMe && "👈 (BẠN)"}
                  </span>
                </div>
                <span className="text-2xl font-black text-amber-900 dark:text-amber-100">{p.score}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}