"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  RefreshCw, 
  Terminal, 
  Grid, 
  Activity,
  ArrowLeft
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "./components/Sidebar";
import OverviewTab from "./components/OverviewTab";
import PdfManagerTab from "./components/PdfManagerTab";
import ReportsTab from "./components/ReportsTab";
import UserManagerTab from "./components/UserManagerTab";
import { moderatorAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

type Tab = "overview" | "pdfs" | "reports" | "users";

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Telemetry state
  const [stats, setStats] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Monitor Zustand hydration
  useEffect(() => {
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        setTimeout(checkHydration, 50);
      }
    };
    checkHydration();
  }, []);

  // Parallel data synchronization
  const syncTelemetry = useCallback(async (silent = false) => {
    if (silent) setSyncing(true);
    else setLoading(true);

    try {
      const [resStats, resNotes, resReports, resUsers] = await Promise.all([
        moderatorAPI.getStats(),
        moderatorAPI.getNotes(),
        moderatorAPI.getReports(),
        moderatorAPI.getUsers()
      ]);

      setStats(resStats.data.stats || null);
      setNotes(resNotes.data.notes || []);
      setReports(resReports.data.reports || []);
      setUsers(resUsers.data.users || []);
      
      if (silent) {
        toast.success("TELEMETRY RESYNC COMPLETE");
      }
    } catch (err) {
      toast.error("TELEMETRY SYNC FAILURE — SECURE FEED INTERRUPTION");
      console.error(err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // Page guarding & telemetry initiation
  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    if (user?.role !== "admin" && user?.role !== "superadmin") {
      router.push("/dashboard");
      return;
    }

    syncTelemetry();
  }, [isHydrated, isAuthenticated, user, router, syncTelemetry]);

  const handleSignOut = () => {
    logout();
    router.push("/auth");
    toast.success("SECURE SESSION TERMINATED");
  };

  /* ─── RENDER SUB-TAB ─── */
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="glass-card p-6 h-32 bg-white/[0.02] border-white/5 animate-pulse flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5" />
                <div className="h-6 w-16 bg-white/5 rounded" />
                <div className="h-4 w-24 bg-white/5 rounded" />
              </div>
            ))}
          </div>
          <div className="glass-card p-8 h-96 bg-white/[0.02] border-white/5 animate-pulse" />
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return <OverviewTab stats={stats} />;
      case "pdfs":
        return <PdfManagerTab notes={notes} onRefresh={() => syncTelemetry(true)} />;
      case "reports":
        return <ReportsTab reports={reports} onRefresh={() => syncTelemetry(true)} />;
      case "users":
        return <UserManagerTab users={users} onRefresh={() => syncTelemetry(true)} />;
      default:
        return <OverviewTab stats={stats} />;
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="mesh-bg min-h-screen bg-[#020204] text-white flex overflow-hidden relative">
      {/* Background cyber overlays */}
      <div className="fixed inset-0 cyber-grid-overlay pointer-events-none z-0 opacity-15" />
      <div className="fixed top-[-20%] left-[-15%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0 animate-nebula-1" />
      <div className="fixed bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none z-0 animate-nebula-2" />

      {/* Floating Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleSignOut} 
      />

      {/* Main Moderation Arena */}
      <main className="flex-1 min-h-screen pl-80 pr-10 pt-10 pb-20 overflow-y-auto relative z-10">
        
        {/* Telemetry Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-4">
            {/* Quick platform return option */}
            <button 
              onClick={() => router.push("/dashboard")}
              className="p-3 rounded-xl border border-white/5 bg-black/40 backdrop-blur-xl text-gray-400 hover:text-blue-400 hover:border-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 flex items-center justify-center gap-2 group text-xs font-mono font-bold"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>EXIT_TO_PLATFORM</span>
            </button>
            <div className="w-[1.5px] h-8 bg-gradient-to-b from-blue-500/20 via-transparent to-purple-500/20 hidden md:block" />
            
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5 font-display">
                Moderation Command
                <span className="text-[9px] font-mono font-normal text-blue-400/40 tracking-widest hidden sm:inline">// MOD_DECK_STN_L3</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <p className="text-[9px] text-blue-400/60 font-mono tracking-widest uppercase font-bold">SECURE CHANNEL STATUS: NOMINAL</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Realtime stats badge */}
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[9px] text-gray-500 tracking-wider">
              <Activity size={10} className="text-purple-400" />
              <span>ROLE: {user?.role?.toUpperCase()}</span>
            </div>

            <button 
              onClick={() => syncTelemetry(true)}
              disabled={syncing}
              className="px-4 py-3 rounded-xl border border-white/5 bg-black/40 backdrop-blur-xl hover:bg-white/5 hover:border-blue-500/20 text-gray-400 hover:text-blue-400 transition-all duration-300 flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest disabled:opacity-40"
            >
              <RefreshCw size={12} className={syncing ? "animate-spin text-blue-400" : ""} />
              SYNC FEED
            </button>
          </div>
        </header>

        {/* Dynamic Tab Arena */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (loading ? "-loading" : "-ready")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Console status ticker */}
        <footer className="mt-12 flex items-center justify-between text-[8px] font-mono text-gray-600 tracking-widest uppercase px-1">
          <div className="flex items-center gap-2">
            <Terminal size={10} className="text-blue-500/50" />
            <span>NEXUS MOD CONSOLE LOG // CONNECTION ENCRYPTED VIA TLS_1.3</span>
          </div>
          <span>Berd Vault Governance Dec. 2026</span>
        </footer>

      </main>
    </div>
  );
}
