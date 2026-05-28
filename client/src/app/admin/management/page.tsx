"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { adminAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldCheck, 
  Trash2, 
  Loader2,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  Radar,
  Fingerprint,
  Lock,
  Unlock,
  Cpu,
  Zap,
  Radio,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Particles from "../../super-admin/components/Particles";

/* ── Stagger animation variants ────────────────────── */
const containerStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};
const itemFade = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
};

export default function AdminManagementPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "superadmin") {
      router.push("/dashboard");
      return;
    }
    router.replace("/super-admin");
  }, [user]);

  const fetchData = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [reqs, ads] = await Promise.all([
        adminAPI.getRequests(),
        adminAPI.getList()
      ]);
      setRequests(reqs.data.requests);
      setAdmins(ads.data.admins);
    } catch (err) {
      toast.error("NEURAL LINK FAILURE: DATA SYNC INTERRUPTED");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionInProgress(id);
    try {
      await adminAPI.approve(id);
      toast.success("⚡ ACCESS GRANTED — ADMIN AUTHORIZED");
      fetchData(true);
    } catch (err) {
      toast.error("AUTHORIZATION PROTOCOL FAILED");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionInProgress(id);
    try {
      await adminAPI.reject(id);
      toast.success("🛡️ REQUEST DENIED — ACCESS BLOCKED");
      fetchData(true);
    } catch (err) {
      toast.error("REJECTION PROTOCOL FAILED");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("⚠️ CRITICAL: Confirm permanent revocation of admin clearance?")) return;
    setActionInProgress(id);
    try {
      await adminAPI.remove(id);
      toast.success("🔥 ADMIN PURGED — CLEARANCE REVOKED");
      fetchData(true);
    } catch (err) {
      toast.error("PURGE PROTOCOL FAILED");
    } finally {
      setActionInProgress(null);
    }
  };

  /* ── LOADING STATE — Dramatic Boot Screen ─────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-[#020204] text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Ambient backdrop */}
      <div className="fixed inset-0 cyber-grid-overlay pointer-events-none z-0 opacity-20" />
      <div className="fixed top-[-30%] left-[-20%] w-[70%] h-[70%] bg-cyan-900/15 rounded-full blur-[180px] pointer-events-none z-0 animate-nebula-1" />
      <div className="fixed bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-purple-900/15 rounded-full blur-[180px] pointer-events-none z-0 animate-nebula-2" />
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated radar ring */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-cyan-500/30 animate-pulse" />
          <div className="absolute inset-4 rounded-full border border-purple-500/20" />
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            <Fingerprint className="text-cyan-400 animate-pulse" size={24} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-cyan-400 font-mono tracking-[0.3em] uppercase font-black animate-pulse">
            DECRYPTING GOVERNANCE DECK
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
            <p className="text-[9px] text-gray-600 font-mono tracking-widest">VERIFYING SUPERADMIN BIOMETRICS...</p>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );

  /* ── MAIN VIEW ─────────────────────────────────────────────── */
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#020204] text-white flex flex-col overflow-hidden font-sans selection:bg-cyan-500/30 w-full relative pb-20"
    >
      <Particles />
      
      {/* Cyber Grid Overlay */}
      <div className="fixed inset-0 cyber-grid-overlay pointer-events-none z-0 opacity-30" />
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.025] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Noise Texture */}
      <div className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.012]" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')" }} />
      
      {/* Moving Ambient Nebulas */}
      <div className="fixed top-[-25%] left-[-15%] w-[65%] h-[65%] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none z-0 animate-nebula-1" />
      <div className="fixed bottom-[-25%] right-[-15%] w-[65%] h-[65%] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none z-0 animate-nebula-2" />

      {/* HUD Edge Telemetry Bezels */}
      <div className="fixed top-3 left-4 pointer-events-none z-[100] text-[8px] font-mono text-cyan-400/50 uppercase tracking-[0.25em] hidden xl:block font-black">
        [ NEXUS_CORE // ADMIN_GOV_DECK ]
      </div>
      <div className="fixed top-3 right-4 pointer-events-none z-[100] text-[8px] font-mono text-cyan-400/50 uppercase tracking-[0.25em] hidden xl:block font-black">
        [ STN: L5_AUTH_OPS // {requests.length + admins.length}_ENTITIES ]
      </div>
      <div className="fixed bottom-3 left-4 pointer-events-none z-[100] text-[8px] font-mono text-purple-400/50 uppercase tracking-[0.25em] hidden xl:block font-black">
        [ AUTH_LINK: SUPERADMIN_CLEARANCE ]
      </div>
      <div className="fixed bottom-3 right-4 pointer-events-none z-[100] text-[8px] font-mono text-purple-400/50 uppercase tracking-[0.25em] hidden xl:block font-black">
        [ GOVERNANCE_ACTIVE // SYSTEM_ONLINE ]
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 w-full relative z-10">
        
        {/* ── TACTICAL COMMAND HEADER ──────────────────── */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          {/* Top accent line */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-8" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Return button */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/super-admin")}
                className="group p-3.5 rounded-xl border border-white/5 bg-black/60 backdrop-blur-xl text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[9px] font-mono font-black uppercase tracking-wider">RETURN_TO_NEXUS</span>
              </motion.button>
              
              <div className="w-[1.5px] h-10 bg-gradient-to-b from-cyan-500/30 via-white/5 to-purple-500/30 hidden md:block" />
              
              {/* Title Block */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* Radar pulse around icon */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-sm animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/10 border border-cyan-500/25 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <Shield size={26} className="text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3 font-display">
                    Admin Governance
                    <span className="text-[9px] font-mono font-normal text-cyan-400/50 tracking-widest hidden sm:inline">// SEC_MANAGEMENT_L5</span>
                  </h1>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex items-center justify-center">
                        <span className="absolute w-2 h-2 rounded-full bg-emerald-500/40 animate-ping" />
                        <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                      </span>
                      <p className="text-[9px] text-emerald-400/70 font-mono tracking-widest font-bold uppercase">LIVE</p>
                    </div>
                    <span className="text-[8px] text-gray-700">|</span>
                    <p className="text-[9px] text-gray-500 font-mono tracking-widest">ACCESS CONTROL & CLEARANCE OPERATIONS</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* Stats micro-badges */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/15 flex items-center gap-1.5">
                  <AlertTriangle size={10} className="text-amber-400" />
                  <span className="text-[9px] font-mono font-black text-amber-400 tracking-wider">{requests.length} PENDING</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-purple-500/5 border border-purple-500/15 flex items-center gap-1.5">
                  <Radio size={10} className="text-purple-400" />
                  <span className="text-[9px] font-mono font-black text-purple-400 tracking-wider">{admins.length} ACTIVE</span>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchData(true)}
                className="p-3.5 rounded-xl border border-white/5 bg-black/60 backdrop-blur-xl hover:bg-white/5 hover:border-cyan-500/25 text-gray-400 hover:text-cyan-400 transition-all duration-300 flex items-center gap-2 font-mono text-[9px] font-black tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin text-cyan-400" : ""} />
                SYNC
              </motion.button>
            </div>
          </div>
          
          {/* Bottom accent line */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent mt-8" />
        </motion.header>

        {/* ── DUAL DECK GRID ───────────────────────────── */}
        <motion.div 
          variants={containerStagger} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          
          {/* ═══ COLUMN 1: PENDING REQUESTS SECTOR ═══ */}
          <motion.section variants={itemFade} className="space-y-5">
            {/* Section Header */}
            <div className="glass-nexus rounded-xl p-4 cyber-bracket cyber-bracket-bottom">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.03] to-transparent rounded-xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Radar className="text-amber-400" size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-white flex items-center gap-2">
                      Incoming Requests
                      {requests.length > 0 && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                        </span>
                      )}
                    </h2>
                    <p className="text-[8px] text-gray-600 font-mono tracking-widest mt-0.5">{requests.length} AUTHORIZATION NODE{requests.length !== 1 ? "S" : ""} IN QUEUE</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-black text-amber-400/60 tracking-widest">SEC_REQ</span>
              </div>
            </div>
            
            {/* Request Cards */}
            <AnimatePresence mode="popLayout">
              {requests.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl border border-white/[0.04] bg-black/40 backdrop-blur-xl p-14 text-center overflow-hidden cyber-bracket cyber-bracket-bottom shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                >
                  {/* Interior glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.02] via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-900/50 border border-white/[0.04] flex items-center justify-center">
                      <Lock size={32} className="text-gray-700" />
                    </div>
                    <h3 className="text-xs font-mono font-black text-gray-500 uppercase tracking-[0.2em]">Authorization Queue Clear</h3>
                    <p className="text-[9px] text-gray-700 font-mono tracking-widest mt-2">NO PENDING ACCESS REQUEST NODES DETECTED</p>
                    <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-auto mt-4" />
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req, idx) => (
                    <motion.div 
                      key={req._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={`group relative rounded-2xl border border-white/[0.04] bg-black/50 backdrop-blur-xl p-5 overflow-hidden transition-all duration-500 hover:border-amber-500/15 hover:shadow-[0_8px_32px_rgba(245,158,11,0.08)] cyber-bracket cyber-bracket-bottom shadow-[0_4px_24px_rgba(0,0,0,0.5)] ${actionInProgress === req._id ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      {/* Left accent */}
                      <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent" />
                      
                      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                        <div className="flex items-center gap-4 w-full min-w-0">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/10 blur-sm opacity-60" />
                            <div className="relative w-13 h-13 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                              {req.avatar ? (
                                <img src={req.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Shield size={22} className="text-amber-400/80" />
                              )}
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-black text-white text-sm truncate uppercase font-mono tracking-tight">{req.name}</h3>
                              <span className="text-[7px] font-mono text-gray-600">#{req._id?.slice(-4)}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono truncate">{req.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[7px] font-mono uppercase tracking-widest font-black text-amber-400 bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded-md inline-flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.08)]">
                                <Zap size={7} /> AWAITING_AUTH
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                          <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReject(req._id)}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-red-500/15 bg-red-500/5 text-red-400 font-mono font-black text-[8px] uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-300 flex items-center justify-center gap-1.5"
                          >
                            <UserX size={13} /> OP_DENY
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApprove(req._id)}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600/90 via-blue-600/90 to-purple-600/90 text-white font-mono font-black text-[8px] uppercase tracking-widest shadow-[0_4px_20px_rgba(6,182,212,0.2)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.4)] transition-all duration-300 flex items-center justify-center gap-1.5 border border-cyan-500/20"
                          >
                            <Unlock size={13} /> OP_AUTHORIZE
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* ═══ COLUMN 2: ACTIVE ADMIN ROSTER ═══ */}
          <motion.section variants={itemFade} className="space-y-5">
            {/* Section Header */}
            <div className="glass-nexus rounded-xl p-4 cyber-bracket cyber-bracket-bottom">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.03] to-transparent rounded-xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Cpu className="text-purple-400" size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-white flex items-center gap-2">
                      Active Admin Roster
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      </span>
                    </h2>
                    <p className="text-[8px] text-gray-600 font-mono tracking-widest mt-0.5">{admins.length} REGISTERED CLEARANCE HOLDER{admins.length !== 1 ? "S" : ""}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-black text-purple-400/60 tracking-widest">ADM_REG</span>
              </div>
            </div>
            
            {/* Admin Cards */}
            <AnimatePresence mode="popLayout">
              {admins.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl border border-white/[0.04] bg-black/40 backdrop-blur-xl p-14 text-center overflow-hidden cyber-bracket cyber-bracket-bottom shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.02] via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-900/50 border border-white/[0.04] flex items-center justify-center">
                      <ShieldAlert size={32} className="text-gray-700" />
                    </div>
                    <h3 className="text-xs font-mono font-black text-gray-500 uppercase tracking-[0.2em]">Roster Empty</h3>
                    <p className="text-[9px] text-gray-700 font-mono tracking-widest mt-2">NO REGISTERED ADMIN ENTITIES FOUND</p>
                    <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-auto mt-4" />
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {admins.map((ad, idx) => (
                    <motion.div 
                      key={ad._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={`group relative rounded-2xl border border-white/[0.04] bg-black/50 backdrop-blur-xl p-5 overflow-hidden transition-all duration-500 hover:border-purple-500/15 hover:shadow-[0_8px_32px_rgba(168,85,247,0.08)] cyber-bracket cyber-bracket-bottom shadow-[0_4px_24px_rgba(0,0,0,0.5)] ${actionInProgress === ad._id ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      {/* Left accent */}
                      <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-purple-500/60 via-purple-500/20 to-transparent" />
                      
                      <div className="relative z-10 flex items-center justify-between gap-5">
                        <div className="flex items-center gap-4 w-full min-w-0">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/10 blur-sm opacity-50" />
                            <div className="relative w-13 h-13 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                              {ad.avatar ? (
                                <img src={ad.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Shield size={22} className="text-purple-400/80" />
                              )}
                            </div>
                            {/* Online indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-black border-2 border-black flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-black text-white text-sm truncate uppercase font-mono tracking-tight">{ad.name}</h3>
                              <ShieldCheck size={12} className="text-purple-400/60 shrink-0" />
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono truncate">{ad.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[7px] font-mono uppercase tracking-widest font-black text-purple-400 bg-purple-500/10 border border-purple-500/15 px-2 py-0.5 rounded-md inline-flex items-center gap-1 shadow-[0_0_8px_rgba(168,85,247,0.08)]">
                                <Shield size={7} /> ADMIN_LEVEL_01
                              </span>
                              <span className="text-[7px] font-mono uppercase tracking-widest text-emerald-400/60 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                VERIFIED
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Purge Button */}
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemove(ad._id)}
                          className="px-4 py-2.5 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400/80 font-mono font-black text-[8px] uppercase tracking-widest hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 hover:shadow-[0_0_25px_rgba(239,68,68,0.15)] transition-all duration-300 flex items-center gap-1.5 shrink-0"
                          title="Revoke Admin Access"
                        >
                          <Trash2 size={12} />
                          PURGE
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.section>

        </motion.div>

        {/* ── BOTTOM STATUS BAR ────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center justify-between px-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
            <span className="text-[8px] font-mono text-gray-600 tracking-widest uppercase">GOVERNANCE_MODULE // REALTIME_SYNC_ACTIVE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-mono text-gray-600 tracking-widest uppercase">LATENCY: 12ms</span>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
