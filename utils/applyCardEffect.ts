import { CardType } from "@/types/card";
import {
  updateScore,
  multiplyScore,
  resetScore,
} from "./firebase";

interface ApplyCardParams {
  roomCode: string;
  playerId: string;
  card: CardType;
}

export async function applyCardEffect({
  roomCode,
  playerId,
  card,
}: ApplyCardParams) {

  let delta = 0;

  switch (card) {
    case "+50":
      delta = 50;
      break;
    case "+100":
      delta = 100;
      break;
    case "+150":
      delta = 150;
      break;

    case "-50":
      delta = -50;
      break;
    case "-100":
      delta = -100;
      break;
    case "-150":
      delta = -150;
      break;

    case "x2":
      await multiplyScore(roomCode, playerId, 2);
      return;

    case "x3":
      await multiplyScore(roomCode, playerId, 3);
      return;

    case "loseAll":
      await resetScore(roomCode, playerId);
      return;

    case "steal20":
    case "steal50":
    case "swap":
    default:
      return;
  }

  await updateScore(roomCode, playerId, delta);
}
