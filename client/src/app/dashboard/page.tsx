"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, BookOpen, Upload, Bookmark, Download, Shield, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NoteCard from "@/components/ui/NoteCard";
import { useAuthStore } from "@/lib/store";
import { notesAPI, usersAPI } from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [trending,  setTrending]  = useState<any[]>([]);
  const [recent,    setRecent]    = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [uploads,   setUploads]   = useState<any[]>([]);
  const [profile,   setProfile]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trending" | "recent" | "bookmarks" | "uploads">("trending");
  const notesSectionRef = useRef<HTMLDivElement>(null);
  
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait until Zustand has finished client-side hydration
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        setTimeout(checkHydration, 50);
      }
    };
    checkHydration();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) { router.push("/auth"); return; }
    if (user?.role === "staff") { router.push("/staff"); return; }
    
    Promise.all([
      notesAPI.getTrending(),
      notesAPI.getRecent(),
      usersAPI.getProfile(user!._id),
      usersAPI.getBookmarks()
    ]).then(([t, r, p, b]) => {
      setTrending(t.data.notes || []);
      setRecent(r.data.notes || []);
      setProfile(p.data.user || null);
      setUploads(p.data.notes || []);
      setBookmarks(b.data.bookmarks || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isHydrated, isAuthenticated]);

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const tabContent = { trending, recent, bookmarks, uploads };

  const currentNotes = useMemo(() => {
    return tabContent[activeTab] || [];
  }, [activeTab, trending, recent, bookmarks, uploads]);

  const uploadCount = Math.max(profile?.uploadCount || 0, uploads.length);
  const downloadCount = Math.max(
    profile?.downloadCount || 0,
    uploads.reduce((total, note) => total + (note.downloads || 0), 0)
  );

  const isSuperAdmin = user?.role === "superadmin";

  const activateTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    notesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBookmarkChange = (note: any, isBookmarked: boolean) => {
    setBookmarks((current) => {
      const exists = current.some((item) => item._id === note._id);
      if (isBookmarked && !exists) return [note, ...current];
      if (!isBookmarked) return current.filter((item) => item._id !== note._id);
      return current;
    });
  };

  if (loading || !isHydrated) return <LoadingScreen />;

  return (
    <div className="mesh-bg min-h-screen relative overflow-x-hidden">
      <Navbar />
      
      {/* Floating Admin Button */}
      {isSuperAdmin && (
        <div className="fixed top-24 right-6 z-40">
          <Link 
            href="/super-admin"
            className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-amber-500 hover:bg-amber-500/10 transition-all shadow-lg border border-amber-500/30 ring-2 ring-amber-500/20"
            title="Admin Management Dashboard"
          >
            <Shield size={22} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          </Link>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">

        {/* Welcome card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF]/10 to-[#00D4AA]/10 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[var(--text-muted)] text-sm">{getHour()} 👋</p>
              <h1 className="font-display text-3xl font-bold mt-1">
                Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
              </h1>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                {user?.college && `${user.college} · `}{user?.department && `${user.department} · `}{user?.year}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/browse" className="btn-outline py-2 px-5 text-sm">
                <BookOpen size={16} /> Browse
              </Link>
              <Link href="/upload" className="btn-brand py-2 px-5 text-sm">
                <Upload size={16} /> Upload
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Section 1: OVERVIEW STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { 
              label: "Total Uploads", 
              value: uploadCount, 
              icon: <Upload size={20} />, 
              color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
              tab: "uploads" as const,
            },
            { 
              label: "Bookmarks Saved", 
              value: bookmarks.length, 
              icon: <Bookmark size={20} />, 
              color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
              tab: "bookmarks" as const,
            },
            { 
              label: "Trending Notes", 
              value: trending.length, 
              icon: <TrendingUp size={20} />, 
              color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
              tab: "trending" as const,
            },
            { 
              label: "Notes Shared (Downloads)", 
              value: downloadCount, 
              icon: <Download size={20} />, 
              color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
              tab: "uploads" as const,
            },
          ].map((stat, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => activateTab(stat.tab)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "glass-card p-5 flex items-center justify-between bg-gradient-to-br border relative overflow-hidden text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/60",
                stat.color,
                activeTab === stat.tab && "ring-2 ring-[#6C63FF]/50"
              )}
              aria-label={`Show ${stat.label.toLowerCase()}`}
            >
              <div>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="font-display text-2xl font-black mt-1 text-white tracking-tight">{stat.value}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 transition-transform group-hover:scale-110">
                {stat.icon}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Section 2: RECENT NOTES / UPLOADS (Tab component) */}
        <div ref={notesSectionRef} className="scroll-mt-28 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(["uploads", "trending", "recent", "bookmarks"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  activeTab === t
                    ? "bg-[#6C63FF] text-white shadow-glow"
                    : "bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {{uploads: "Uploads", trending: "Trending", recent: "Recent", bookmarks: "Bookmarks"}[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Notes grid */}
        {currentNotes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">{activeTab === "bookmarks" ? "🔖" : "📚"}</p>
            <h3 className="font-display text-xl font-semibold mb-2">
              {activeTab === "bookmarks" ? "No bookmarks yet" : activeTab === "uploads" ? "No uploads yet" : "No notes found"}
            </h3>
            <p className="text-[var(--text-muted)] text-sm mb-6">
              {activeTab === "bookmarks" ? "Bookmark notes while browsing to save them here" : activeTab === "uploads" ? "Upload your first note to see it here" : "Check back soon for new notes"}
            </p>
            <Link href={activeTab === "uploads" ? "/upload" : "/browse"} className="btn-brand py-2 px-6 text-sm">
              {activeTab === "uploads" ? "Upload Notes" : "Browse Notes"} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {currentNotes.map((note: any, i: number) => (
              <NoteCard key={note._id} note={note} index={i} onBookmarkChange={handleBookmarkChange} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
