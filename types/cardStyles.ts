import { CardType } from "./card";

export const cardStyles: Record<
  CardType,
  {
    bg: string;
    icon: string;
  }
> = {
  swap: { bg: "bg-purple-500 text-white", icon: "↔️" },
  x2: { bg: "bg-green-400 text-white", icon: "x2" },
  x3: { bg: "bg-blue-500 text-white", icon: "x3" },

  "+50": { bg: "bg-amber-200", icon: "+50" },
  "+100": { bg: "bg-yellow-400", icon: "+100" },
  "+150": { bg: "bg-orange-400", icon: "+150" },

  "-50": { bg: "bg-pink-200", icon: "-50" },
  "-100": { bg: "bg-pink-400", icon: "-100" },
  "-150": { bg: "bg-red-500 text-white", icon: "-150" },

  loseAll: { bg: "bg-gray-900 text-white", icon: "💀" },

  steal20: { bg: "bg-yellow-800 text-white", icon: "🏴‍☠️ 20%" },
  steal50: { bg: "bg-red-700 text-white", icon: "🏴‍☠️ 50%" },
};
