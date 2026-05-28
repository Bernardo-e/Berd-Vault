"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/lib/store";
import { useStudyStore } from "@/lib/studyStore";
import { Timer, Play, Pause, RotateCcw, X, Award, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

export default function FocusTimer() {
  const { examMode } = useThemeStore();
  const { addSession, currentStreak, todayStudySeconds, sessionsCompleted } = useStudyStore();

  const [seconds, setSeconds] = useState(25 * 60); 
  const [isActive, setIsActive] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
        setSessionSeconds((ss) => ss + 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      if (sessionSeconds > 0) {
        addSession(sessionSeconds);
        toast.success(`Incredible! Completed a focus session of ${Math.round(sessionSeconds / 60)} minutes.`);
        setSessionSeconds(0);
      }
      if ("vibrate" in navigator) navigator.vibrate([500, 200, 500]);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, sessionSeconds, addSession]);

  const handleToggle = () => {
    if (isActive) {
      // Paused: save accumulated seconds
      if (sessionSeconds > 5) {
        addSession(sessionSeconds);
        toast.success(`Progress saved: ${sessionSeconds}s of focus session recorded.`);
      }
      setSessionSeconds(0);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    if (sessionSeconds > 5) {
      addSession(sessionSeconds);
      toast.success(`Progress saved: ${sessionSeconds}s recorded.`);
    }
    setSessionSeconds(0);
    setSeconds(25 * 60);
    setCustomInput("");
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {examMode && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-full max-w-sm px-4"
        >
          {/* Collapsible Panel (Stats + Custom Setup) */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: 10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: 10 }}
                className="w-full glass border border-purple-500/30 rounded-2xl p-4 bg-black/95 backdrop-blur-3xl shadow-[0_0_30px_rgba(157,80,187,0.3)] overflow-hidden"
              >
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-3">
                  <Award size={14} />
                  My Study Stats
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="text-lg">🔥</span>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Streak</p>
                    <p className="text-xs font-black text-white">{currentStreak} days</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="text-lg">⏱️</span>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Today</p>
                    <p className="text-xs font-black text-white">{Math.round(todayStudySeconds / 60)}m</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="text-lg">🏆</span>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Sessions</p>
                    <p className="text-xs font-black text-white">{sessionsCompleted}</p>
                  </div>
                </div>

                {/* Presets and Custom Inputs */}
                <div className="pt-3 border-t border-white/5">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Timer Configuration</p>
                  <div className="flex items-center justify-between gap-3">
                    {/* Preset buttons */}
                    <div className="flex gap-1">
                      {[25, 45, 60].map((preset) => (
                        <button
                          key={preset}
                          disabled={isActive}
                          onClick={() => {
                            setSeconds(preset * 60);
                            setCustomInput("");
                            toast.success(`Timer set to ${preset} min`);
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-[#6C63FF]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {preset}m
                        </button>
                      ))}
                    </div>

                    {/* Custom Input */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        disabled={isActive}
                        min="1"
                        max="180"
                        placeholder="Custom"
                        value={customInput}
                        onChange={(e) => {
                          setCustomInput(e.target.value);
                          const val = parseInt(e.target.value);
                          if (val > 0 && val <= 180) {
                            setSeconds(val * 60);
                          }
                        }}
                        className="w-14 px-2 py-1 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-white text-center focus:outline-none focus:border-purple-500/50 disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                      <span className="text-[9px] text-zinc-400 font-bold uppercase">min</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Focus Timer Bar */}
          <div className="glass px-6 py-4 rounded-full border border-purple-500/50 shadow-[0_0_40px_rgba(157,80,187,0.4)] flex items-center justify-between w-full backdrop-blur-3xl bg-black/80">
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded-full hover:bg-white/5 text-purple-400 transition-colors"
              title="Show Study Stats & Setup"
            >
              {showStats ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>

            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black tracking-[0.25em] text-purple-400 uppercase">Deep Focus</span>
              <div className="flex items-center gap-3 mt-0.5">
                <button 
                  disabled={isActive}
                  onClick={() => setSeconds(Math.max(60, seconds - 300))}
                  className="text-white/25 hover:text-purple-400 disabled:opacity-0 transition-all font-black text-sm"
                >
                  -5m
                </button>
                <div className="text-3xl font-mono font-bold text-white tabular-nums drop-shadow-[0_0_10px_rgba(157,80,187,0.5)]">
                  {formatTime(seconds)}
                </div>
                <button 
                  disabled={isActive}
                  onClick={() => setSeconds(seconds + 300)}
                  className="text-white/25 hover:text-purple-400 disabled:opacity-0 transition-all font-black text-sm"
                >
                  +5m
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggle}
                className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-400 transition-all shadow-[0_0_15px_rgba(157,80,187,0.4)] hover:scale-105"
              >
                {isActive ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
              </button>
              
              <button
                onClick={handleReset}
                className="w-8 h-8 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
