"use client";

import { useState, useEffect, useRef } from "react";
import GameCard from "./game-card";
import { CardType } from "@/types/card";
import { calculateScore } from "@/utils/calculateScore";
import { applyCardEffect } from "@/utils/applyCardEffect";
import { getPlayerScore, onLeaderboardUpdate, onPlayerNotification, onPlayerScoreUpdate, removePlayerNotification, stealScore, swapScore, updateScore } from "@/utils/firebase";
import { randomCards } from "@/utils/randomCards";
import { QUESTIONS_DATA } from "@/data/question";

type Phase = "question" | "card" | "popup" | "selectPlayer";

interface Question {
  question: string;
  options: string[];
  answer: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
}

function shuffle<T>(arr: T[]): T[] {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function GamePlay({ roomCode, playerId }: { roomCode: string; playerId: string }) {
  const [phase, setPhase] = useState<Phase>("question");
  const [score, setScore] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Khi component mount thì phát nhạc
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
      audioRef.current.play().catch((err) => {
        console.log("Autoplay bị chặn:", err);
      });
    }

    return () => {
      // Khi unmount thì tắt nhạc
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const [questions, setQuestions] = useState<Question[]>(shuffle(QUESTIONS_DATA));
  const [currentIdx, setCurrentIdx] = useState(0);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(18);

  const CARD_COUNT = 3;
  const MAX_FLIP = 1;
  const [cardOptions, setCardOptions] = useState<CardType[]>([]);
  const [cardsFlipped, setCardsFlipped] = useState<boolean[]>([]);
  const [cardFlipsLeft, setCardFlipsLeft] = useState(MAX_FLIP);
  const [isCardProcessing, setIsCardProcessing] = useState(false);
  const [notifyQueue, setNotifyQueue] = useState<any[]>([]);
  const [activeNotify, setActiveNotify] = useState<any | null>(null);

  // State cho cướp điểm
  const [pendingStealCard, setPendingStealCard] = useState<CardType | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  // Timer
  useEffect(() => {
    if (phase !== "question" || selectedOption) return;

    if (timeLeft <= 0) {
      setSelectedOption("");
      setTimeout(nextQuestion, 800);
      return;
    }

    const timer = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase, selectedOption]);

  // Lắng nghe điểm của player hiện tại
  useEffect(() => {
    if (!roomCode || !playerId) return;

    const unsubscribe = onPlayerScoreUpdate(
      roomCode,
      playerId,
      (newScore) => {
        setScore(newScore);
      }
    );

    return () => unsubscribe();
  }, [roomCode, playerId]);

  useEffect(() => {
    if (!roomCode || !playerId) return;

    const unsub = onPlayerNotification(roomCode, playerId, (n) => {
      setNotifyQueue((q) => [...q, n]);
    });

    return () => unsub?.();
  }, [roomCode, playerId]);


  useEffect(() => {
    if (activeNotify || notifyQueue.length === 0) return;

    setActiveNotify(notifyQueue[0]);
    setNotifyQueue((q) => q.slice(1));
  }, [notifyQueue, activeNotify]);

  useEffect(() => {
    if (!activeNotify) return;

    const timer = setTimeout(() => {
      removePlayerNotification(roomCode, playerId, activeNotify.id);
      setActiveNotify(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeNotify, roomCode, playerId]);

  // Lắng nghe danh sách tất cả người chơi (realtime)
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = onLeaderboardUpdate(roomCode, (leaderboard) => {
      const players = leaderboard.map((p, idx) => ({
        id: p.id,
        name: p.name,
        score: p.score,
      }));
      setAllPlayers(players);
    });

    return () => unsubscribe();
  }, [roomCode]);

  const handleAnswer = (option: string) => {
    if (selectedOption) return;

    const correctOption = currentQuestion.options[currentQuestion.answer];
    setSelectedOption(option);
    const isCorrect = option === correctOption;

    if (!isCorrect) {
      setTimeout(nextQuestion, 1200);
      return;
    }

    // Correct answer - add score
    const baseScore = 100;
    const timeBonus = timeLeft * 5;
    const gained = baseScore + timeBonus;
    updateScore(roomCode, playerId, gained);

    // Reset card state for new question
    setCardFlipsLeft(MAX_FLIP);

    // Show popup
    setTimeout(() => {
      setPhase("popup");
    }, 800);
  };

  const handlePickCard = () => {
    // Generate new cards each time
    setCardOptions(randomCards(CARD_COUNT));
    setCardsFlipped(Array(CARD_COUNT).fill(false));
    setPhase("card");
  };

  const handleCardClick = (idx: number) => {
    if (
      isCardProcessing ||
      cardsFlipped[idx] ||
      cardFlipsLeft <= 0
    ) return;

    setIsCardProcessing(true);

    setCardsFlipped((prev) =>
      prev.map((v, i) => (i === idx ? true : v))
    );

    const card = cardOptions[idx];

    setTimeout(() => {
      // Kiểm tra nếu là bài cướp điểm hoặc swap
      if (card === "steal20" || card === "steal50" || card === "swap") {
        setPendingStealCard(card);
        setPhase("selectPlayer");
        setIsCardProcessing(false);
      } else {
        // Áp dụng hiệu ứng bình thường
        applyCardEffect({
          roomCode,
          playerId,
          card,
        });

        setCardFlipsLeft((prev) => {
          const remaining = prev - 1;

          if (remaining > 0) {
            setTimeout(() => {
              setPhase("popup");
              setIsCardProcessing(false);
            }, 800);
          } else {
            setTimeout(() => {
              nextQuestion();
              setIsCardProcessing(false);
            }, 1200);
          }

          return remaining;
        });
      }
    }, 500);
  };

  const handleSelectPlayer = async (targetPlayerId: string) => {
    if (!pendingStealCard) return;

    // Áp dụng hiệu ứng cướp điểm
    if (pendingStealCard === "steal20") {
      await stealScore(roomCode, playerId, targetPlayerId, "STEAL_20");
    } else if (pendingStealCard === "steal50") {
      await stealScore(roomCode, playerId, targetPlayerId, "STEAL_50");
    } else if (pendingStealCard === "swap") {
      await swapScore(roomCode, playerId, targetPlayerId);
    }

    setPendingStealCard(null);

    // Tiếp tục game
    setCardFlipsLeft((prev) => {
      const remaining = prev - 1;

      if (remaining > 0) {
        setPhase("popup");
      } else {
        setTimeout(() => {
          nextQuestion();
        }, 800);
      }

      return remaining;
    });
  };

  const CARD_TIME_LIMIT = 10;
  const [cardTimeLeft, setCardTimeLeft] = useState<number | null>(null);

  const timeoutHandledRef = useRef(false);

  const handleCardTimeout = () => {
    // 🛑 chặn gọi nhiều lần
    if (timeoutHandledRef.current) return;
    timeoutHandledRef.current = true;

    // mở khóa lại sau 1s
    setTimeout(() => {
      timeoutHandledRef.current = false;
    }, 1000);

    // ===== LOGIC CŨ GIỮ NGUYÊN =====
    setPendingStealCard(null);
    setIsCardProcessing(false);

    setCardFlipsLeft((prev) => {
      const remaining = prev - 1;

      if (remaining > 0) {
        setPhase("popup");
      } else {
        nextQuestion();
      }

      return remaining;
    });
  };



  useEffect(() => {
    if (
      phase !== "popup" &&
      phase !== "card" &&
      phase !== "selectPlayer"
    ) {
      setCardTimeLeft(null);
      return;
    }

    setCardTimeLeft(CARD_TIME_LIMIT);

    const timer = setInterval(() => {
      setCardTimeLeft((prev) => {
        if (!prev) return prev;
        if (prev <= 1) {
          handleCardTimeout();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);


  const nextQuestion = () => {
    setSelectedOption(null);
    setTimeLeft(18);
    setCardFlipsLeft(MAX_FLIP);
    setPhase("question");

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setCurrentIdx(0);
      setTimeout(() => {
        setQuestions(shuffle(QUESTIONS_DATA));
      }, 0);
    }
  };

  const currentQuestion = questions[currentIdx];


  // Lấy danh sách người chơi khác (không bao gồm mình)
  const otherPlayers = allPlayers.filter(p => p.id !== playerId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-yellow-50 to-orange-100 p-6">
      <audio ref={audioRef} src="/Lobby-music.mp3" autoPlay loop />
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-xl shadow-2xl p-6 border-4 border-yellow-400">
          <p className="text-lg font-bold drop-shadow">📊 ĐIỂM CHIẾN THẮNG</p>
          <p className="text-5xl font-black drop-shadow-lg">{score}</p>
          <p className="text-sm mt-2 drop-shadow">Càng cao càng tốt - Hãy chinh phục!</p>
        </div>

        {/* Question Phase */}
        {phase === "question" && currentQuestion && (
          <div className="p-8 border-4 border-amber-800 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900 dark:to-yellow-900 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full font-bold drop-shadow">
                  📚 Câu hỏi {currentIdx + 1}/{questions.length}
                </div>
              </div>
              <div className={`text-3xl font-black font-mono drop-shadow transition ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-amber-800'}`}>
                ⏱️ {timeLeft}s
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-amber-900 dark:text-amber-100 leading-tight drop-shadow">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((opt, index) => {
                const isCorrect = index === currentQuestion.answer;
                const isSelected = opt === selectedOption;

                let style = "bg-white dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100";

                if (selectedOption) {
                  // Nếu là đáp án đúng -> luôn hiển thị màu xanh
                  if (isCorrect) {
                    style = "bg-emerald-500 text-white border-4 border-emerald-600 shadow-lg scale-105";
                  }
                  // Nếu là đáp án được chọn SAI -> hiển thị màu đỏ
                  else if (isSelected) {
                    style = "bg-red-500 text-white border-4 border-red-600 shadow-lg scale-95";
                  }
                }

                return (
                  <button
                    key={opt}
                    className={`p-3 rounded font-medium transition-all ${style}`}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!selectedOption}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Popup Phase */}
        {phase === "popup" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-scale-in">
              <h2 className="text-2xl font-bold text-indigo-600 mb-4">🎉 Trả lời đúng!</h2>
              <p className="text-gray-700 mb-6">
                {cardFlipsLeft === MAX_FLIP
                  ? "Bạn có muốn bóc bài để nhận thưởng thêm?"
                  : `Bạn còn ${cardFlipsLeft} lượt bóc. Tiếp tục?`}
              </p>
              <p className="text-sm text-red-500 mt-2">
                ⏱️ Tự động qua câu kế tiếp sau {cardTimeLeft}s
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handlePickCard}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  🎴 Bóc bài
                </button>
                <button
                  onClick={nextQuestion}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all"
                >
                  ➡️ Câu kế tiếp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Phase */}
        {phase === "card" && (
          <div className="space-y-4 bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-red-500">
              ⏱️ Thời gian chọn bài: {cardTimeLeft}s
            </p>
            <h2 className="text-xl font-bold text-indigo-600">🎴 Chọn bài để bóc</h2>

            <div className="flex justify-center gap-6">
              {cardOptions.map((type, idx) => (
                <GameCard
                  key={idx}
                  type={type}
                  flipped={cardsFlipped[idx]}
                  onClick={() => handleCardClick(idx)}
                />
              ))}
            </div>

            <p className="text-sm text-gray-500">Lượt lật còn lại: {cardFlipsLeft}</p>
          </div>
        )}

        {/* Select Player Phase */}
        {phase === "selectPlayer" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-4 animate-scale-in max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-indigo-600 mb-2">
                {pendingStealCard === "steal20" && "🦹 Cướp 20% điểm"}
                {pendingStealCard === "steal50" && "🦹‍♂️ Cướp 50% điểm"}
                {pendingStealCard === "swap" && "🔄 Hoán đổi điểm"}
              </h2>
              <p className="text-sm text-red-500 mb-3">
                ⏱️ Thời gian chọn người: {cardTimeLeft}s
              </p>
              <p className="text-gray-600 mb-6">Chọn người chơi để thực hiện:</p>

              {otherPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Không có người chơi khác trong phòng</p>
                  <button
                    onClick={() => {
                      setPendingStealCard(null);
                      setCardFlipsLeft((prev) => {
                        const remaining = prev - 1;
                        if (remaining > 0) {
                          setPhase("popup");
                        } else {
                          nextQuestion();
                        }
                        return remaining;
                      });
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition-all"
                  >
                    Tiếp tục
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {otherPlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleSelectPlayer(player.id)}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-between"
                    >
                      <span className="text-lg">{player.name}</span>
                      <span className="text-xl">💰 {player.score}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {activeNotify && (
        <div className="fixed top-6 right-6 z-50 animate-scale-in">
          <div className="rounded-xl bg-white shadow-xl border px-4 py-3 max-w-xs">
            {activeNotify.type === "STEAL" && (
              <p className="text-sm text-red-600 font-semibold">
                ❌ Bạn bị <strong>{activeNotify.fromName}</strong> cướp{" "}
                <strong>{activeNotify.amount}</strong> điểm
              </p>
            )}

            {activeNotify.type === "SWAP" && (
              <p className="text-sm text-purple-600 font-semibold">
                🔄 Điểm của bạn vừa bị hoán đổi với{" "}
                <strong>{activeNotify.fromName}</strong>
              </p>
            )}
          </div>
        </div>
      )}


      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}