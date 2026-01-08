"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gamepad2, Clock, CheckCircle, Info, Trophy } from "lucide-react";
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
    if (adminKey === "BO_MAY_LA_ADMIN") setIsAdmin(true);
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
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Gamepad2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Giao diện Admin</CardTitle>
                <CardDescription>Tạo phòng và theo dõi người chơi tham gia</CardDescription>
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
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Gamepad2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Tham gia trò chơi</CardTitle>
                <CardDescription>Nhập mã phòng để tham gia cùng bạn bè</CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Luật chơi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Thời gian */}
          <div className="flex gap-3 rounded-lg bg-muted/50 p-4">
            <Clock className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Thời gian</p>
              <p className="text-sm text-muted-foreground">18 giây cho mỗi câu hỏi</p>
              <p className="text-sm text-muted-foreground">
                Dự kiến trò chơi sẽ diễn ra trong 8 phút, trò chơi sẽ kết thúc khi admin đóng phòng
              </p>
            </div>
          </div>

          {/* Nội dung trả lời */}
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
            <p className="text-sm">Trả lời các câu hỏi về cơ sở hình thành tư tưởng Hồ Chí Minh</p>
          </div>

          {/* Cơ chế bốc bài */}
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
            <div className="text-sm">
              Cơ chế bốc bài:
              <ul className="list-disc ml-5">
                <li>Mỗi lần trả lời đúng, bạn được điểm nhiều hoặc ít dựa trên thời gian trả lời nhanh/chậm.</li>
                <li>Sau đó, bạn được bốc <strong>1 lá card</strong> từ bộ bài (có thể bỏ qua nếu không muốn bốc).</li>
                <li>Mỗi lá card sẽ ảnh hưởng trực tiếp đến điểm số của bạn hoặc đối thủ (nhân điểm, cộng/trừ điểm, cướp điểm, mất toàn bộ…)</li>
                <li>Nếu trả lời sai, bạn không được điểm và có thể chuyển sang câu hỏi tiếp theo.</li>
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