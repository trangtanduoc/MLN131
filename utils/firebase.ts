import { firebaseApp } from "@/config/firebaseConfig"
import { getDatabase, ref, set, update, get, onValue, remove, runTransaction, onChildAdded } from "firebase/database"
import { push } from "firebase/database";

const db = getDatabase(firebaseApp)

// Random 6 ký tự
export const generateRoomCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Random playerId
export const generatePlayerId = (): string => {
  return crypto.randomUUID()
}


type NotifyType = "STEAL" | "SWAP";

interface PlayerNotification {
  type: "STEAL" | "SWAP";
  fromId: string;
  fromName: string;
  amount?: number;
}

export const pushPlayerNotification = async (
  roomCode: string,
  targetPlayerId: string,
  payload: PlayerNotification
) => {
  const notifyRef = ref(
    db,
    `rooms/${roomCode}/notifications/${targetPlayerId}`
  );

  await push(notifyRef, {
    ...payload,
    createdAt: Date.now(),
  });
};

export const removePlayerNotification = async (
  roomCode: string,
  playerId: string,
  notifyId: string
) => {
  const notifyRef = ref(
    db,
    `rooms/${roomCode}/notifications/${playerId}/${notifyId}`
  );

  await remove(notifyRef);
};

export const onPlayerNotification = (
  roomCode: string,
  playerId: string,
  callback: (notify: any) => void
) => {
  const notifyRef = ref(
    db,
    `rooms/${roomCode}/notifications/${playerId}`
  );

  const unsubscribe = onChildAdded(notifyRef, (snap) => {
    const notify = snap.val();
    if (!notify) return;

    callback({
      id: snap.key,
      ...notify,
    });
  });

  return unsubscribe;
};


export const onPlayerScoreUpdate = (
  roomCode: string,
  playerId: string,
  callback: (score: number) => void
) => {
  const scoreRef = ref(db, `rooms/${roomCode}/players/${playerId}/score`);

  const unsubscribe = onValue(scoreRef, (snap) => {
    callback(snap.val() || 0);
  });

  return unsubscribe;
};

export const endGame = async (roomCode: string) => {
  await update(ref(db, `rooms/${roomCode}`), {
    status: "endGame",
    gameStarted: false,
    gameEnded: true,
  });
};

export const getRoomStatus = async (roomCode: string): Promise<{ status: "open" | "closed"; gameStarted?: boolean } | null> => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snap = await get(roomRef);
  if (!snap.exists()) return null;
  return { status: snap.val().status, gameStarted: snap.val().gameStarted || false };
};

// Realtime listener cho trạng thái phòng
export const onRoomStatusUpdate = (
  roomCode: string,
  callback: (status: { status: string; gameStarted: boolean }) => void
) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const unsubscribe = onValue(roomRef, (snap) => {
    const room = snap.val();
    callback({ status: room?.status || "closed", gameStarted: room?.gameStarted || false });
  });

  return unsubscribe; // ✅ trả về function
};

// --- 2.1 Tạo phòng ---
export const createRoom = async () => {
  const roomCode = generateRoomCode();
  const adminKey = generatePlayerId();
  await set(ref(db, `rooms/${roomCode}`), {
    adminKey,
    status: "open",
    gameStarted: false,
    createdAt: Date.now(),
    players: {}
  });
  return { roomCode, adminKey };
};

export const startGame = async (roomCode: string) => {
  await update(ref(db, `rooms/${roomCode}`), { gameStarted: true });
};

// --- 2.2 Tham gia phòng ---
export const joinRoom = async (
  roomCode: string,
  playerName: string
) => {
  const playersRef = ref(db, `rooms/${roomCode}/players`);
  const snapshot = await get(playersRef);

  if (snapshot.exists()) {
    const players = snapshot.val();

    const isDuplicate = Object.values(players).some(
      (player: any) =>
        player.name.trim().toLowerCase() === playerName.trim().toLowerCase()
    );

    if (isDuplicate) {
      throw new Error("DUPLICATE_NAME");
    }
  }

  const playerId = generatePlayerId();

  await set(ref(db, `rooms/${roomCode}/players/${playerId}`), {
    name: playerName.trim(),
    score: 0,
    joinedAt: Date.now(),
  });

  return playerId;
};

// --- 2.3 Kết thúc phòng (admin) ---
export const closeRoom = async (roomCode: string) => {
  await update(ref(db, `rooms/${roomCode}`), {
    status: "closed"
  })
}

// --- 2.4 Update điểm ---
// cộng/trừ điểm
export const updateScore = async (
  roomCode: string,
  playerId: string,
  delta: number
) => {
  const scoreRef = ref(db, `rooms/${roomCode}/players/${playerId}/score`)

  await runTransaction(scoreRef, (currentScore) => {
    const score = currentScore || 0
    return Math.max(0, score + delta) // chặn âm
  })
}

export const multiplyScore = async (
  roomCode: string,
  playerId: string,
  factor: number = 2
) => {
  const scoreRef = ref(db, `rooms/${roomCode}/players/${playerId}/score`)

  await runTransaction(scoreRef, (currentScore) => {
    if (currentScore === null) return 0
    return currentScore * factor
  })
}

// mất toàn bộ điểm
export const resetScore = async (roomCode: string, playerId: string) => {
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { score: 0 })
}

type StealType = "STEAL_20" | "STEAL_50"

export const stealScore = async (
  roomCode: string,
  thiefId: string,
  victimId: string,
  type: StealType
) => {
  const playersRef = ref(db, `rooms/${roomCode}/players`);
  let stolenAmount = 0;
  let thiefName = "";

  await runTransaction(playersRef, (players) => {
    if (!players || !players[thiefId] || !players[victimId]) return players;

    thiefName = players[thiefId].name; // 👈 lấy tên tại thời điểm đó

    const victimScore = players[victimId].score || 0;
    if (victimScore <= 0) return players;

    const percent = type === "STEAL_20" ? 0.2 : 0.5;
    stolenAmount = Math.floor(victimScore * percent);

    players[victimId].score = Math.max(0, victimScore - stolenAmount);
    players[thiefId].score = (players[thiefId].score || 0) + stolenAmount;

    return players;
  });

  if (stolenAmount > 0) {
    await pushPlayerNotification(roomCode, victimId, {
      type: "STEAL",
      fromId: thiefId,
      fromName: thiefName,
      amount: stolenAmount,
    });
  }
};



export const swapScore = async (
  roomCode: string,
  playerAId: string,
  playerBId: string
) => {
  const playersRef = ref(db, `rooms/${roomCode}/players`);

  let playerAName = "";
  let playerBName = "";

  await runTransaction(playersRef, (players) => {
    if (!players || !players[playerAId] || !players[playerBId]) return players;

    // 👇 snapshot tên tại thời điểm swap
    playerAName = players[playerAId].name;
    playerBName = players[playerBId].name;

    const temp = players[playerAId].score || 0;
    players[playerAId].score = players[playerBId].score || 0;
    players[playerBId].score = temp;

    return players;
  });

  // 🔔 notify cho A
  await pushPlayerNotification(roomCode, playerAId, {
    type: "SWAP",
    fromId: playerBId,
    fromName: playerBName,
  });

  // 🔔 notify cho B
  await pushPlayerNotification(roomCode, playerBId, {
    type: "SWAP",
    fromId: playerAId,
    fromName: playerAName,
  });
};


// --- 2.5 Lắng nghe realtime leaderboard (admin) ---
export const onLeaderboardUpdate = (
  roomCode: string,
  callback: (players: { id: string; name: string; score: number }[]) => void
) => {
  const roomRef = ref(db, `rooms/${roomCode}/players`);
  const unsubscribe = onValue(roomRef, (snap) => {
    const players = snap.val() || {};
    const leaderboard = Object.entries(players)
      .map(([id, p]: [string, any]) => ({
        id,
        name: p.name,
        score: p.score
      }))
      .sort((a, b) => b.score - a.score);
    callback(leaderboard);
  });

  return unsubscribe;
};


export const getPlayerScore = async (
  roomCode: string,
  playerId: string
): Promise<number | null> => {
  const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`)
  const snap = await get(playerRef)
  if (!snap.exists()) return null
  return snap.val().score || 0
}