"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  RefreshCw,
  Terminal,
  Menu,
  ArrowLeft
} from "lucide-react";
import { StatsSkeleton, ListSkeleton, ChartSkeleton } from "@/components/ui/Skeletons";
import { adminAPI, engagementAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// Overhauled Elite Components
import EliteSidebar from "./components/EliteSidebar";
import EliteAnalytics from "./components/EliteAnalytics";
import EliteActivityFeed from "./components/EliteActivityFeed";
import EliteRequestPanel from "./components/EliteRequestPanel";
import EliteUsersTab from "./components/EliteUsersTab";
import EliteContentMatrix from "./components/EliteContentMatrix";
import EliteOverviewDeck from "./components/EliteOverviewDeck";
import EliteReportsCenter from "./components/EliteReportsCenter";
import ElitePlatformControls from "./components/ElitePlatformControls";
import Particles from "./components/Particles";
import EliteBootSequence from "./components/EliteBootSequence";

type Tab = "overview" | "analytics" | "activity" | "requests" | "users" | "content" | "reports" | "controls";

export default function SuperAdminDashboard() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);

  // Close sidebar on tab change for smoother mobile UX
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  // Data State
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [controls, setControls] = useState<any>(null);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" ? localStorage.getItem("nv_token") : null;
    if (!isAuthenticated && !hasToken) {
      router.push("/auth");
      return;
    }
    if (!isAuthenticated || !user) return;

    if (user.role !== "superadmin") {
      router.push("/dashboard");
      return;
    }
    syncData();
  }, [isAuthenticated, user, router]);

  const syncData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [statsRes, activityRes, requestRes, userRes, noteRes, reportRes, announcementRes, controlRes, activeRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getActivityLogs(),
        adminAPI.getPendingRequests(),
        adminAPI.getUsers(),
        adminAPI.getNotes(),
        adminAPI.getReports(),
        adminAPI.getAnnouncements(),
        adminAPI.getControls(),
        engagementAPI.getActiveUsers(),
      ]);
      setStats({ ...(statsRes.data.stats || {}), activeUsers: activeRes.data.activeUsers || 0 });
      setActivities(activityRes.data.logs || []);
      setRequests(requestRes.data.requests || []);
      setUsers(userRes.data.users || []);
      setNotes(noteRes.data.notes || []);
      setReports(reportRes.data.reports || []);
      setAnnouncements(announcementRes.data.announcements || []);
      setControls(controlRes.data.controls || {});
    } catch {
      toast.error("Neural link sync interrupted. Reconnecting.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  if (!bootComplete) {
    return <EliteBootSequence onComplete={() => setBootComplete(true)} isLoadingData={loading} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.01 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#030307] text-white flex overflow-hidden font-sans selection:bg-indigo-500/30 w-full relative"
    >
      <Particles />
      
      {/* Subtle Background Ambient Nebulas */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Modern Sidebar */}
      <EliteSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => { logout(); router.push("/"); }} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden lg:pl-80 transition-all duration-300">
        
        {/* ── Minimal Premium Header ── */}
        <header className="h-20 border-b border-white/[0.04] flex items-center justify-between px-6 lg:px-10 relative z-20 bg-[#030307]/40 backdrop-blur-3xl">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all text-white"
            >
              <Menu size={16} />
            </button>
            
            {/* Elegant Back Button */}
            <button 
              onClick={() => router.push("/dashboard")}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] hover:border-indigo-500/20 text-xs font-bold text-gray-400 hover:text-white transition-all duration-200"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Platform</span>
            </button>
            
            <div className="w-[1px] h-4 bg-white/[0.08]" />

            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
              </span>
              <h2 className="text-base font-extrabold uppercase tracking-tight text-white font-sans">
                {activeTab === "overview" ? "Command Overview" : activeTab.replace("_", " ")}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => syncData(true)}
              className={cn(
                "p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200",
                refreshing && "animate-spin text-indigo-400 border-indigo-500/20"
              )}
            >
              <RefreshCw size={15} />
            </button>
            <div className="w-8 h-8 rounded-xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-center">
              <Shield size={14} className="text-indigo-400" />
            </div>
          </div>
        </header>

        {/* ── Dynamic Main Content Viewport ── */}
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto"
            >
              {loading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {Array(5).fill(0).map((_, i) => <StatsSkeleton key={i} />)}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <ChartSkeleton />
                    </div>
                    <div className="lg:col-span-1">
                      <ListSkeleton count={4} />
                    </div>
                  </div>
                </div>
              ) : activeTab === "overview" ? (
                <div className="space-y-8">
                  {/* Top Stats Overview Section */}
                  <EliteOverviewDeck stats={stats} setActiveTab={setActiveTab} />
                  
                  {/* Side-by-Side Analytics Growth & Live Feeds Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-7">
                      <EliteActivityFeed activities={activities} />
                    </div>
                    <div className="xl:col-span-5">
                      <EliteRequestPanel requests={requests} users={users} onRefresh={syncData} />
                    </div>
                  </div>
                </div>
              ) : activeTab === "analytics" ? (
                <EliteAnalytics stats={stats} />
              ) : activeTab === "requests" ? (
                <EliteRequestPanel requests={requests} users={users} onRefresh={syncData} />
              ) : activeTab === "users" ? (
                <EliteUsersTab users={users} setUsers={setUsers} onRefresh={syncData} />
              ) : activeTab === "content" ? (
                <EliteContentMatrix notes={notes} setNotes={setNotes} onRefresh={syncData} />
              ) : activeTab === "reports" ? (
                <EliteReportsCenter reports={reports} onRefresh={syncData} />
              ) : activeTab === "activity" ? (
                <EliteActivityFeed activities={activities} />
              ) : activeTab === "controls" ? (
                <ElitePlatformControls controls={controls} announcements={announcements} onRefresh={syncData} />
              ) : (
                <div className="relative rounded-3xl border border-white/[0.04] bg-[#07070c]/50 p-20 text-center overflow-hidden">
                  <Terminal size={32} className="mx-auto mb-4 text-gray-700" />
                  <h3 className="text-xs font-mono font-bold text-gray-600 uppercase tracking-widest">Sub-module Offline</h3>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
}
