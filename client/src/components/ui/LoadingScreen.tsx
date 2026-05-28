"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#05050A]">
      {/* Background Glows (Instant mount) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px]" />

      <div className="relative flex flex-col items-center">
        {/* Animated Logo Container */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(157,80,187,0.4)] mb-8"
        >
          <Zap size={40} className="text-white fill-white" />
        </motion.div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold font-display text-white tracking-widest">
            BERD <span className="text-purple-500">VAULT</span>
          </h2>
          <div className="flex items-center gap-1">
             <motion.span 
               animate={{ opacity: [0, 1, 0] }}
               transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.3, 1] }}
               className="text-cyan-400 font-mono text-sm uppercase tracking-[0.3em]"
             >
               Synchronizing
             </motion.span>
             <motion.div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 h-1 bg-cyan-400 rounded-full"
                  />
                ))}
             </motion.div>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="mt-12 w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-full h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          />
        </div>
      </div>
    </div>
  );
};
