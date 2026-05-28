"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldAlert, Cpu, Database, Wifi, Zap } from "lucide-react";

interface EliteBootSequenceProps {
  onComplete: () => void;
  isLoadingData: boolean;
}

const SYSTEM_LOGS = [
  { text: "NEXUSCORE SYSTEM BOOTSTRAP INITIALIZED...", delay: 100, type: "info" },
  { text: "CHECKING LOCAL SECURITY ENCLAVE CONFIG...", delay: 350, type: "info" },
  { text: "LOCAL ENCRYPTED TOKENS DECRYPTION: [ OK ]", delay: 600, type: "success" },
  { text: "SECURE TUNNEL ESTABLISHED TO VAULT STORAGE NODE...", delay: 900, type: "info" },
  { text: "SYNCING LIVE TELEMETRY CHANNELS: [ STABLE ]", delay: 1200, type: "success" },
  { text: "VERIFYING ADMIN LEVEL 5 AUTHORITY POLICIES...", delay: 1500, type: "info" },
  { text: "ACCESS MATRIX SYNCED (SA_OVERLORD_TOKEN: MATCH)...", delay: 1800, type: "success" },
  { text: "CALIBRATING COCKPIT RADIAL INTERFACES...", delay: 2100, type: "info" },
  { text: "NEXUS ONLINE - COCKPIT SYSTEM IS FULLY OPTIMAL.", delay: 2400, type: "success" },
];

export default function EliteBootSequence({ onComplete, isLoadingData }: EliteBootSequenceProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isBypassing, setIsBypassing] = useState(false);

  // Sync log streaming
  useEffect(() => {
    const timers = SYSTEM_LOGS.map((log) => {
      return setTimeout(() => {
        setLogs((prev) => [...prev, `${log.type === "success" ? "✓" : "❯"} ${log.text}`]);
        setCurrentStep((prev) => prev + 1);
      }, log.delay);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Handle smooth progress bar count
  useEffect(() => {
    if (isBypassing) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isBypassing]);

  // Once both the boot animations and the API data loading are finished (or if bypassed), trigger onComplete
  useEffect(() => {
    if ((progress === 100 && !isLoadingData && currentStep >= SYSTEM_LOGS.length) || isBypassing) {
      const finishTimeout = setTimeout(() => {
        onComplete();
      }, 350);
      return () => clearTimeout(finishTimeout);
    }
  }, [progress, isLoadingData, currentStep, isBypassing, onComplete]);

  const handleBypass = () => {
    setIsBypassing(true);
    setProgress(100);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-[#020204] text-white flex flex-col justify-between p-8 md:p-12 font-mono overflow-hidden">
      {/* Dynamic scanlines & matrix grid backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,3px_100%]" />
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[size:30px_30px]" 
        style={{
          backgroundImage: "linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)"
        }}
      />
      
      {/* Background neon ambient nodes */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Telemetry Header */}
      <header className="flex justify-between items-start border-b border-white/5 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h1 className="text-xs font-black tracking-[0.4em] uppercase bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">BERD CORE SECURE TERMINAL</h1>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">CLEARANCE LEVEL 5 // OVERLORD PROMPT</p>
        </div>
        <div className="text-right text-[10px] text-gray-500 space-y-1">
          <p>STATION: VAULT-NEXUS-08</p>
          <p className="text-cyan-400/80 font-black">STABLE NEURAL SYNC // {progress}%</p>
        </div>
      </header>

      {/* Main Terminal Frame */}
      <div className="flex-1 my-10 flex flex-col lg:flex-row gap-8 items-center lg:items-stretch justify-center relative z-10 max-w-7xl mx-auto w-full">
        {/* Holographic Radar / Sync Core Visualizer */}
        <div className="flex-1 flex flex-col justify-center items-center relative min-h-[250px] lg:min-h-0">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outermost ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed"
            />
            {/* Mid ring */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border border-purple-500/30 border-t-purple-400 border-b-cyan-400"
            />
            {/* Inner tech dial */}
            <motion.div 
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-10 rounded-full border border-white/5 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.1)]"
            >
              <Cpu size={32} className="text-cyan-400 animate-pulse mb-2" />
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black">NEXUS CORE</span>
              <span className="text-[8px] text-emerald-400 mt-1 uppercase tracking-widest font-black">SYNCED</span>
            </motion.div>

            {/* Sweep radar line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent w-full h-[2px] top-1/2 -translate-y-1/2 animate-bounce opacity-40" />
          </div>
        </div>

        {/* Console Log Area */}
        <div className="flex-[1.5] w-full bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
          </div>
          
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar font-mono text-xs">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`${
                    log.startsWith("✓") ? "text-cyan-400 font-bold" : "text-gray-400"
                  } flex items-start gap-2 leading-relaxed`}
                >
                  <span className="text-[9px] text-gray-600 mt-0.5">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {progress < 100 && (
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-flex gap-1 items-center text-cyan-400/75 mt-1 font-bold"
              >
                <span>❯ ANALYZING DATAFEEDS</span>
                <span className="w-1 h-3 bg-cyan-400 animate-pulse" />
              </motion.div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-2/3">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1.5 uppercase tracking-widest font-bold">
                <span>Core Synchronization Status</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <button
              onClick={handleBypass}
              className="text-[9px] uppercase tracking-[0.25em] font-black border border-cyan-500/20 hover:border-cyan-400 bg-cyan-950/20 text-cyan-300 hover:text-white px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
            >
              Skip Sync Probing
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info HUD */}
      <footer className="flex flex-col sm:flex-row justify-between items-center border-t border-white/5 pt-6 text-[9px] text-gray-600 tracking-widest gap-4 relative z-10">
        <div className="flex gap-6">
          <p className="flex items-center gap-1"><Zap size={11} className="text-purple-500" /> SECURE HANDSHAKE: COMPLETED</p>
          <p className="flex items-center gap-1"><Wifi size={11} className="text-cyan-500" /> NODE LINK: 12MS LATENCY</p>
        </div>
        <p>© BERD CORE SYSTEMS v4.0.2 // ALL POWER PRIVILEGES GRANTED</p>
      </footer>
    </div>
  );
}
