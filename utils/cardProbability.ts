import { CARD_POOL } from "@/types/card";

const totalWeight = CARD_POOL.reduce((s, c) => s + c.weight, 0);

export function getCardProbability(weight: number) {
  return ((weight / totalWeight) * 100).toFixed(1);
}

export function getCardRarity(weight: number) {
  if (weight >= 20) return "Thường";
  if (weight >= 8) return "Ít gặp";
  if (weight >= 3) return "Hiếm";
  return "Cực hiếm";
}
