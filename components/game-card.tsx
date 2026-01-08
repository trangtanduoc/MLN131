"use client";

import { CardType } from "@/types/card";
import { cardStyles } from "@/types/cardStyles";

interface GameCardProps {
  type: CardType;
  flipped: boolean;
  onClick: () => void;
}

export default function GameCard({ type, flipped, onClick }: { type: CardType; flipped: boolean; onClick: () => void }) {
  const style = cardStyles[type];

  return (
    <div onClick={onClick} className="w-32 h-44 cursor-pointer" style={{ perspective: "1000px" }}>
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        className="relative w-full h-full"
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 bg-blue-600 rounded-xl flex items-center justify-center text-white text-4xl font-bold shadow-lg"
        >
          ?
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center font-bold text-xl shadow-lg ${style.bg}`}
        >
          <span className="text-3xl mb-2">{style.icon}</span>
          <span className="text-sm opacity-80">{type}</span>
        </div>
      </div>
    </div>
  );
}
