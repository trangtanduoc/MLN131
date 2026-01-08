"use client";
import GameCard from "./game-card";
import { X } from "lucide-react";
import { CARD_POOL } from "@/types/card";
import { getCardProbability, getCardRarity } from "@/utils/cardProbability";

export default function CardRulesPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-5 rounded-xl max-w-4xl w-full relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
          onClick={onClose}
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold mb-6">🎴 Luật & Tỷ lệ Card</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CARD_POOL.map((card) => (
            <div
              key={card.type}
              className="flex flex-col items-center gap-1 border rounded-lg p-2 text-sm"
            >
              <div className="scale-[0.85]">
              <GameCard type={card.type} flipped onClick={() => {}}/>
              </div>
              <p className="font-semibold">{card.desc}</p>

              <p className="text-sm text-gray-500">
                🎯 Tỷ lệ: {getCardProbability(card.weight)}%
              </p>

              <span className="text-xs px-2 py-1 rounded bg-gray-200">
                {getCardRarity(card.weight)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
