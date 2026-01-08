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
    <Card className="border-2 border-primary/20 shadow-xl">
      <CardHeader>
        <CardTitle>Bảng xếp hạng</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
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
                  "flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200",
                  // Top 3 styling với màu sắc nổi bật
                  p.rank === 1 && "bg-yellow-500/20 border-2 border-yellow-500",
                  p.rank === 2 && "bg-gray-400/20 border-2 border-gray-400",
                  p.rank === 3 && "bg-orange-600/20 border-2 border-orange-600",
                  p.rank > 3 && "bg-muted/50",
                  // Highlight người chơi hiện tại
                  isMe && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">
                    {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}
                  </span>
                  <span className={cn("font-medium", isMe && "text-primary font-bold")}>
                    {p.name}
                  </span>
                </div>
                <span className="text-lg font-bold">{p.score} điểm</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}