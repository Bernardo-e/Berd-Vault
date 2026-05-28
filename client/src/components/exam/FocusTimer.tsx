"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/lib/store";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";

export const FocusTimer: React.FC = () => {
  const { examMode } = useThemeStore();
  const [seconds, setSeconds] = useState(25 * 60); // Default 25 mins
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      // Optional: Play sound or notification
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {examMode && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className="glass p-4 rounded-2xl border-purple-500/30 shadow-[0_0_20px_rgba(157,80,187,0.2)] flex flex-col items-center gap-3 min-w-[160px]">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
              <Timer size={16} className="animate-pulse" />
              <span>FOCUS TIMER</span>
            </div>
            
            <div className="text-3xl font-bold font-mono tracking-wider text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {formatTime(seconds)}
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setIsActive(!isActive)}
                className="p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 transition-colors"
              >
                {isActive ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={() => { setIsActive(false); setSeconds(25 * 60); }}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
