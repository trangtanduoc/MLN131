export type CardType =
  | "swap"
  | "x2"
  | "x3"
  | "+50"
  | "+100"
  | "+150"
  | "-50"
  | "-100"
  | "-150"
  | "loseAll"
  | "steal20"
  | "steal50";

export interface CardConfig {
  type: CardType;
  weight: number;
  desc: string;
}

/**
 * Pool bài – dùng cho random theo weight
 */
export const CARD_POOL: CardConfig[] = [
  // === CỘNG ĐIỂM (GIẢM) ===
  { type: "+50", weight: 20, desc: "Cộng thêm 50 điểm." },
  { type: "+100", weight: 12, desc: "Cộng thêm 100 điểm." },
  { type: "+150", weight: 6, desc: "Cộng thêm 150 điểm." },

  // === TRỪ ĐIỂM (TĂNG NHẸ) ===
  { type: "-50", weight: 18, desc: "Trừ 50 điểm." },
  { type: "-100", weight: 14, desc: "Trừ 100 điểm." },
  { type: "-150", weight: 12, desc: "Trừ 150 điểm." },

  // === NHÂN (GIẢM RÕ) ===
  { type: "x2", weight: 8, desc: "Nhân đôi điểm vừa nhận." },
  { type: "x3", weight: 2, desc: "Nhân ba điểm vừa nhận." },

  // === TƯƠNG TÁC / PHÁ GAME (TĂNG) ===
  {
    type: "steal20",
    weight: 10,
    desc: "Cướp 20% tổng điểm của một người chơi khác.",
  },
  {
    type: "steal50",
    weight: 4,
    desc: "Cướp 50% tổng điểm của một người chơi khác.",
  },
  {
    type: "swap",
    weight: 12,
    desc: "Hoán đổi toàn bộ điểm với một người chơi khác.",
  },
  {
    type: "loseAll",
    weight: 8,
    desc: "Mất toàn bộ điểm hiện tại.",
  },
];
