"use client";

import { useEffect, useState } from "react";
import { onLeaderboardUpdate } from "@/utils/firebase";

export interface PlayerRank {
  playerId: string;
  name: string;
  score: number;
  rank: number;
}

export function useLeaderboard(roomCode: string) {
  const [players, setPlayers] = useState<PlayerRank[]>([]);

  useEffect(() => {
    const unsub = onLeaderboardUpdate(roomCode, (rawPlayers: any[]) => {
      let lastScore: number | null = null;
      let rank = 0;
      let displayRank = 0;

      const ranked = rawPlayers.map((p, idx) => {
        rank++;
        if (p.score !== lastScore) {
          displayRank = rank;
          lastScore = p.score;
        }

        return {
          ...p,
          rank: displayRank,
        };
      });

      setPlayers(ranked);
    });

    return () => unsub();
  }, [roomCode]);

  return players;
}
