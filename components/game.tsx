"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gamepad2, Clock, CheckCircle, Info, Trophy, Zap, Star } from "lucide-react";
import {
  createRoom,
  joinRoom,
  onLeaderboardUpdate,
  closeRoom,
  startGame,
  onRoomStatusUpdate,
  getRoomStatus,
  endGame
} from "@/utils/firebase";
import CardRulesPopup from "./card-rules-popup";
import GamePlay from "./game-play";
import { Leaderboard } from "./leaderboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function Game() {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [joinedPlayers, setJoinedPlayers] = useState<{ id?: string; name: string; score: number }[]>([]);
  const [showCardRules, setShowCardRules] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // check admin
  useEffect(() => {
    const adminKey = localStorage.getItem("ADMIN_KEY");
    if (adminKey === "CHO_NGUOI_NOI_AY") setIsAdmin(true);
  }, []);

  // realtime listeners
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribeLeaderboard = onLeaderboardUpdate(roomCode, (players) => setJoinedPlayers(players));
    const unsubscribeRoomStatus = onRoomStatusUpdate(roomCode, ({ status, gameStarted }) => {
      setRoomClosed(status === "closed");
      setGameStarted(gameStarted);
      setGameEnded(status === "endGame");
    });

    return () => {
      unsubscribeLeaderboard?.();
      unsubscribeRoomStatus?.();
    };
  }, [roomCode]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayMusic = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
      audioRef.current.play().catch((err) => console.log(err));
    }
  };

  // --- Admin actions ---
  const handleCreateRoom = async () => {
    const { roomCode } = await createRoom();
    setRoomCode(roomCode);
    setGameStarted(false);
    setRoomClosed(false);
    setGameEnded(false);
    onLeaderboardUpdate(roomCode, (players) => setJoinedPlayers(players));
  };

  const handleStartGame = async () => {
    if (!roomCode) return;
    await startGame(roomCode);
    handlePlayMusic();
  };

  const handleCloseRoom = async () => {
    if (!roomCode) return;
    await closeRoom(roomCode);
    setRoomClosed(true);
  };

  const handleEndGame = async () => {
    if (!roomCode) return;
    await endGame(roomCode);
    setGameStarted(false);
    setGameEnded(true);
  };

  const handleJoinRoom = async () => {
    if (!roomCode || !playerName.trim()) return;

    const status = await getRoomStatus(roomCode);
    if (!status || status.status === "closed") {
      alert("Phòng này đã bị đóng, không thể tham gia.");
      return;
    }

    try {
      const id = await joinRoom(roomCode, playerName.trim());
      setPlayerId(id);

      onLeaderboardUpdate(roomCode, (players) =>
        setJoinedPlayers(players)
      );

      onRoomStatusUpdate(roomCode, ({ status, gameStarted }) => {
        setRoomClosed(status === "closed");
        setGameStarted(gameStarted);
        setGameEnded(status === "endGame");
      });

    } catch (error: any) {
      if (error.message === "DUPLICATE_NAME") {
        alert("Tên người chơi đã tồn tại, vui lòng chọn tên khác.");
      } else {
        alert("Có lỗi xảy ra khi tham gia phòng.");
      }
    }
  };

  const resetGameState = () => {
    setRoomCode("");
    setPlayerName("");
    setPlayerId(null);
    setJoinedPlayers([]);
    setGameStarted(false);
    setRoomClosed(false);
    setGameEnded(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Vietnamese History Theme Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 p-6 text-white shadow-2xl border-4 border-yellow-400">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)"
        }}></div>
        <div className="relative text-center">
          <h1 className="text-4xl font-bold mb-2 drop-shadow-lg"> MÁC-LÊNIN </h1>
          <p className="text-lg font-semibold drop-shadow-lg">Trò chơi kiến thức về liên minh Công-Nông-Trí</p>
        </div>
      </div>

      {/* End Game Popup cho người chơi */}
      {!isAdmin && gameEnded && (
        <Dialog open={gameEnded} onOpenChange={(open) => {
          if (!open) {
            resetGameState();
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Trò chơi đã kết thúc!
              </DialogTitle>
              <DialogDescription className="text-center">
                Cảm ơn bạn đã tham gia. Dưới đây là bảng xếp hạng cuối cùng.
              </DialogDescription>
            </DialogHeader>

            {/* === SCROLL AREA === */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <Leaderboard
                players={joinedPlayers}
                currentPlayerId={playerId}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}


      {isAdmin ? (
        <>
          {/* === GAME ĐÃ KẾT THÚC === */}
          {gameEnded && (
            <>
              <p className="text-center text-xl font-bold text-yellow-600">
                Trò chơi đã kết thúc
              </p>

              <Leaderboard players={joinedPlayers} />

              <div className="flex justify-center gap-2 mt-4">
                <Button onClick={handleCreateRoom}>Tạo phòng mới</Button>
              </div>
            </>
          )}

          {/* === GAME ĐANG CHƠI === */}
          {gameStarted && !gameEnded && (
            <>
              <div className="flex justify-center gap-2">
                <audio ref={audioRef} src="/Lobby-music.mp3" autoPlay loop />
                <Button onClick={handleEndGame} variant="destructive">
                  Kết thúc trò chơi
                </Button>
              </div>

              <p className="mt-2 text-center text-lg font-semibold">
                Mã phòng: {roomCode}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Số người tham gia: <strong>{joinedPlayers.length}</strong>
              </p>

              <Leaderboard players={joinedPlayers} />
            </>
          )}

          {/* === CHƯA BẮT ĐẦU === */}
          {!gameStarted && !gameEnded && (
            <Card className="border-4 border-red-600 shadow-2xl bg-gradient-to-br from-red-50 to-yellow-50 dark:from-red-950 dark:to-yellow-950">
              <CardHeader className="text-center bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-t-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <Gamepad2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold drop-shadow">⚔️ BẢNG ĐIỀU KHIỂN QUẢN TRỊ ⚔️</CardTitle>
                <CardDescription className="text-white/90 text-base">Lãnh đạo trò chơi - Quản lý người chơi - Theo dõi xếp hạng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="flex justify-center gap-2">
                  <Button onClick={handleCreateRoom}>Tạo phòng mới</Button>
                  {roomCode && !roomClosed && <Button onClick={handleStartGame}>Bắt đầu</Button>}
                  {roomCode && !roomClosed && (
                    <Button onClick={handleCloseRoom} variant="destructive">
                      Đóng phòng
                    </Button>
                  )}
                </div>
                {roomCode && <p className="mt-2 text-lg font-semibold">Mã phòng: {roomCode}</p>}
                {joinedPlayers.length > 0 && (
                  <div className="mt-4 space-y-2 border p-2 rounded">
                    <p className="font-medium mb-2">Danh sách người tham gia:</p>
                    <div className="flex flex-wrap gap-2">
                      {joinedPlayers.map((p, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 bg-primary/20 dark:bg-primary/30 text-primary px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {p.name}
                          {gameStarted && <span className="ml-1 text-xs font-normal">({p.score} điểm)</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {roomClosed && <p className="mt-2 text-red-600 font-semibold">Phòng đã bị đóng</p>}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* === Player UI === */}
          {!playerId && (
            <Card className="border-4 border-yellow-500 shadow-2xl bg-gradient-to-br from-yellow-50 to-red-50 dark:from-yellow-950 dark:to-red-950">
              <CardHeader className="text-center bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-t-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <Star className="h-8 w-8 text-white animate-spin" />
                </div>
                <CardTitle className="text-3xl font-bold drop-shadow">⭐ THAM GIA TRẬN CHIẾN ⭐</CardTitle>
                <CardDescription className="text-white/90 text-base">Nhập mã phòng - Tham gia cùng bạn bè - Chinh phục lịch sử</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input placeholder="Tên của bạn" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
                  <Input
                    placeholder="Nhập mã phòng..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-semibold tracking-widest"
                    maxLength={6}
                  />
                  <Button onClick={handleJoinRoom}>Tham gia</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {playerId && (
            <>
              {gameStarted && !gameEnded ? (
                <GamePlay roomCode={roomCode} playerId={playerId} />
              ) : !gameEnded ? (
                <Card className="border-2 border-primary/20 shadow-xl">
                  <CardHeader>
                    <CardTitle>Phòng: {roomCode}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-64 overflow-y-auto border p-2 rounded">
                    {joinedPlayers.length > 0 && (
                      <div className="mt-4 space-y-2 border p-2 rounded">
                        <p className="font-medium mb-2">Danh sách người tham gia:</p>
                        <div className="flex flex-wrap gap-2">
                          {joinedPlayers.map((p, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-primary/20 dark:bg-primary/30 text-primary px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {p.name}
                              {gameStarted && <span className="ml-1 text-xs font-normal">({p.score} điểm)</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(roomClosed || !gameStarted) && (
                      <p className={`mt-2 font-semibold ${roomClosed ? "text-red-600" : "text-sm text-muted-foreground"}`}>
                        {roomClosed ? "Phòng đã bị đóng" : "Chờ admin bắt đầu..."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}
        </>
      )}

      {/* === Luật chơi === */}
      <Card className="border-4 border-amber-700 shadow-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
        <CardHeader className="bg-gradient-to-r from-amber-800 to-yellow-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold drop-shadow">
            <Zap className="h-6 w-6" />
            📜 LUẬT CHINH CHIẾN 📜
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Thời gian */}
          <div className="flex gap-3 rounded-lg bg-red-100 dark:bg-red-900/30 p-4 border-2 border-red-300 dark:border-red-700">
            <Clock className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-400">⏰ THỜI GIAN CHIẾN ĐẤU</p>
              <p className="text-sm font-semibold text-red-600 dark:text-red-300">18 giây cho mỗi câu hỏi lịch sử</p>
              <p className="text-sm text-red-600 dark:text-red-300">
                Dự kiến 8 phút - Trò chơi kết thúc khi Admin đóng phòng
              </p>
            </div>
          </div>

          {/* Nội dung trả lời */}
          <div className="flex gap-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 p-4 border-2 border-yellow-300 dark:border-yellow-700">
            <CheckCircle className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-bold text-yellow-700 dark:text-yellow-400">📚 CHỦ ĐỀ KIẾN THỨC</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">Trả lời các câu hỏi về Liên Minh Công-Nông-Trí &amp; Mác - Lênin</p>
            </div>
          </div>

          {/* Cơ chế bốc bài */}
          <div className="flex gap-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 p-4 border-2 border-amber-300 dark:border-amber-700">
            <Zap className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-bold text-amber-700 dark:text-amber-400 mb-2">🃏 CƠ CHẾ BỐC BÀI PHÉP THUẬT</p>
              <ul className="list-disc ml-5 space-y-1 text-amber-700 dark:text-amber-300">
                <li>✅ Trả lời <strong>đúng</strong> = Nhận điểm (nhiều/ít tùy tốc độ)</li>
                <li>🎴 Bốc <strong>1 lá card</strong> may mắn từ bộ bài kỳ bí (có thể bỏ qua)</li>
                <li>⚡ Card có thể: nhân điểm, cộng/trừ, cướp, hay mất hết điểm!</li>
                <li>❌ Trả lời <strong>sai</strong> = Không điểm - Chuyển câu tiếp theo</li>
              </ul>
            </div>
          </div>

          <Button className="mt-2" onClick={() => setShowCardRules(true)}>
            Xem luật các loại card
          </Button>
        </CardContent>
      </Card>

      <CardRulesPopup open={showCardRules} onClose={() => setShowCardRules(false)} />
    </div>
  );
}