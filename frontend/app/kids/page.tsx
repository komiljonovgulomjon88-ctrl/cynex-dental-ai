"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Heart, RotateCcw, Play, Award } from "lucide-react";
import confetti from "canvas-confetti";
import AppNav from "@/components/AppNav";

const BADGES = [
  { id: "first",    emoji: "🦷", name: "Birinchi Cho'tka", desc: "Birinchi o'yinni yakunladingiz",   threshold: 1   },
  { id: "streak3",  emoji: "🔥", name: "3 Kunlik Ketma-ket", desc: "Ketma-ket 3 kun",                threshold: 3   },
  { id: "perfect",  emoji: "⭐", name: "Mukammal Kun",      desc: "100% cho'tkalash bali",            threshold: 100 },
  { id: "champion", emoji: "🏆", name: "Chempion",          desc: "10 ta o'yin yakunlandi",           threshold: 10  },
];

type GameState = "idle" | "playing" | "done";

export default function KidsPage() {
  const [gameState, setGameState]   = useState<GameState>("idle");
  const [progress,  setProgress]    = useState(0);
  const [score,     setScore]       = useState(0);
  const [timeLeft,  setTimeLeft]    = useState(120);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [combo,     setCombo]       = useState(0);
  const [lastTap,   setLastTap]     = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cynex_kids");
    if (saved) {
      const s = JSON.parse(saved);
      setEarnedBadges(s.badges || []);
      setTotalGames(s.games || 0);
    }
  }, []);

  const saveProgress = (badges: string[], games: number) => {
    localStorage.setItem("cynex_kids", JSON.stringify({ badges, games }));
  };

  const startGame = () => {
    setProgress(0);
    setScore(0);
    setTimeLeft(120);
    setCombo(0);
    setGameState("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setGameState("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleBrush = () => {
    if (gameState !== "playing") return;

    const now = Date.now();
    const elapsed = now - lastTap;
    setLastTap(now);

    const newCombo = elapsed < 500 ? combo + 1 : 1;
    setCombo(newCombo);

    const gain = Math.min(2 + newCombo * 0.3, 5);
    setProgress((p) => {
      const next = Math.min(p + gain, 100);
      if (next >= 100) {
        clearInterval(timerRef.current!);
        setGameState("done");
      }
      return next;
    });
    setScore((s) => s + 10 + newCombo * 5);
  };

  useEffect(() => {
    if (gameState !== "done") return;
    const newGames = totalGames + 1;
    setTotalGames(newGames);

    const newBadges = [...earnedBadges];
    let changed = false;

    if (progress >= 100 && !newBadges.includes("perfect")) {
      newBadges.push("perfect"); changed = true;
    }
    if (newGames >= 1 && !newBadges.includes("first")) {
      newBadges.push("first"); changed = true;
    }
    if (newGames >= 10 && !newBadges.includes("champion")) {
      newBadges.push("champion"); changed = true;
    }

    if (changed) {
      setEarnedBadges(newBadges);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
    saveProgress(newBadges, newGames);
  }, [gameState]);

  useEffect(() => () => clearInterval(timerRef.current!), []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const getBgColor = () => {
    if (progress < 30) return "from-blue-600 to-blue-800";
    if (progress < 70) return "from-cyan-500 to-blue-600";
    return "from-green-500 to-cyan-500";
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <AppNav />
      <div className="max-w-lg mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            className="text-6xl mb-4"
          >
            🦷
          </motion.div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Cho'tka Chempionlari!
          </h1>
          <p className="text-gray-400">Tishingizni tozalab, mukofotlar yuting!</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Trophy, label: "O'yinlar",   value: totalGames,          color: "text-yellow-400" },
            { icon: Award,  label: "Mukofotlar", value: earnedBadges.length, color: "text-purple-400" },
            { icon: Star,   label: "Ball",       value: score,               color: "text-orange-400" },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-1`} />
              <p className="text-white text-lg font-bold">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Game area */}
        <div className={`card text-center mb-8 relative overflow-hidden ${
          gameState === "idle" ? "glow" : ""
        }`}>
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${getBgColor()} opacity-10`}
            style={{ scaleX: progress / 100, transformOrigin: "left" }}
            animate={{ scaleX: progress / 100 }}
          />

          <AnimatePresence mode="wait">
            {gameState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <p className="text-gray-400 mb-6">O'ynash uchun bosing!</p>
                <button onClick={startGame} className="btn-primary px-10 py-4 text-lg flex items-center gap-2 mx-auto">
                  <Play className="w-5 h-5" /> O'ynash!
                </button>
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="relative z-10"
              >
                {/* Timer */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-2xl font-mono font-bold ${timeLeft <= 10 ? "text-red-400" : "text-white"}`}>
                    ⏱ {formatTime(timeLeft)}
                  </span>
                  <span className="text-yellow-400 font-bold text-lg">⭐ {score}</span>
                </div>

                {/* Progress bar */}
                <div className="bg-gray-800 rounded-full h-5 mb-3 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${getBgColor()}`}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </div>
                <p className="text-sm text-gray-400 mb-6">{Math.round(progress)}% toza</p>

                {combo > 2 && (
                  <motion.div
                    key={combo}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-orange-400 font-bold text-sm mb-3"
                  >
                    🔥 {combo}x Kombo!
                  </motion.div>
                )}

                {/* Brush button */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleBrush}
                  className={`w-32 h-32 rounded-full text-5xl shadow-2xl mx-auto flex items-center justify-center bg-gradient-to-br ${getBgColor()} border-4 border-white/20 select-none`}
                >
                  🪥
                </motion.button>
                <p className="text-gray-400 text-sm mt-4">Cho'tkalash uchun bosing!</p>
              </motion.div>
            )}

            {gameState === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="relative z-10"
              >
                <div className="text-5xl mb-4">
                  {progress >= 100 ? "🎉" : progress >= 60 ? "😊" : "😅"}
                </div>
                <h3 className="text-white text-2xl font-extrabold mb-1">
                  {progress >= 100 ? "Mukammal!" : progress >= 60 ? "Zo'r!" : "Davom eting!"}
                </h3>
                <p className="text-gray-400 mb-2">Ball: <span className="text-yellow-400 font-bold text-xl">{score}</span></p>
                <p className="text-gray-400 mb-6 text-sm">Tozalangan: {Math.round(progress)}%</p>
                <button onClick={startGame} className="btn-primary flex items-center gap-2 mx-auto">
                  <RotateCcw className="w-4 h-4" /> Qayta O'ynash
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Badges */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" /> Mukofotlarim
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {BADGES.map((badge) => {
              const earned = earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-xl p-3 border flex items-center gap-3 transition-all ${
                    earned
                      ? "bg-yellow-900/20 border-yellow-800"
                      : "bg-gray-800/30 border-gray-700 opacity-40"
                  }`}
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <div>
                    <p className={`text-sm font-semibold ${earned ? "text-yellow-400" : "text-gray-500"}`}>
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-500">{badge.desc}</p>
                  </div>
                  {earned && <Star className="w-3.5 h-3.5 text-yellow-400 ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
