"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/lib/store";
import { Rocket, Zap } from "lucide-react";

export const ExamModeOverlay: React.FC = () => {
  const { examMode } = useThemeStore();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (examMode) {
      // Trigger activation ripple from center
      setShowIntro(true);
      const timer = setTimeout(() => setShowIntro(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [examMode]);

  return (
    <AnimatePresence>
      {examMode && (
        <>
          {/* Rocket Activation Animation */}
          {showIntro && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
            >
              <div className="relative">
                {/* Vault Door (Opening) */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="w-48 h-48 rounded-full border-8 border-purple-500/50 flex items-center justify-center relative mb-8"
                  >
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-purple-400 animate-spin-slow" />
                    <Zap size={64} className="text-purple-500 fill-purple-500" />
                  </motion.div>
                  
                  <h2 className="text-4xl font-bold text-white tracking-[0.2em] mb-4">
                    VAULT <span className="text-purple-500">OPENING</span>
                  </h2>
                  
                  {/* Rocket Launching */}
                  <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: -500, opacity: [0, 1, 0] }}
                    transition={{ duration: 2.5, ease: "easeIn" }}
                    className="absolute text-cyan-400"
                  >
                    <div className="relative">
                       <Rocket size={40} className="rotate-[315deg]" />
                       <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4 h-20 bg-gradient-to-t from-transparent via-cyan-400 to-white blur-md animate-pulse" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
          >
            {/* Scan-lines */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-[0.03]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-white animate-scan-line" />
            </div>

            {/* Activation Ripples */}
            {ripples.map((ripple) => (
              <motion.div
                key={ripple.id}
                className="absolute border-2 border-purple-500 rounded-full"
                style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }}
                initial={{ width: 0, height: 0, opacity: 0.8, x: "-50%", y: "-50%" }}
                animate={{ width: "300vmax", height: "300vmax", opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                onAnimationComplete={() => setRipples([])}
              />
            ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
  );
};
