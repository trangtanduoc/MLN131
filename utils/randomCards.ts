import { CARD_POOL, CardType } from "@/types/card";

function getRandomCard(): CardType {
  const total = CARD_POOL.reduce((s, c) => s + c.weight, 0);
  let rand = Math.random() * total;

  for (const card of CARD_POOL) {
    if (rand < card.weight) return card.type;
    rand -= card.weight;
  }

  return "+50";
}

export function randomCards(count: number): CardType[] {
  const set = new Set<CardType>();
  while (set.size < count) {
    set.add(getRandomCard());
  }
  return [...set];
}
