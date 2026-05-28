"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  User, 
  Award,
  Zap,
  ChevronRight,
  Loader2
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { engagementAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ListSkeleton, Skeleton } from "@/components/ui/Skeletons";

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"students" | "staff">("students");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await engagementAPI.getLeaderboard();
      const studentsData = res?.data?.topStudents || [];
      const staffData = res?.data?.topStaff || [];
      const uniqueStudents = Array.from(new Map(studentsData.map((item: any) => [item._id, item])).values());
      const uniqueStaff = Array.from(new Map(staffData.map((item: any) => [item._id, item])).values());
      setStudents(uniqueStudents as any[]);
      setStaff(uniqueStaff as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentList = activeTab === "students" ? students : staff;

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-sm mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <Trophy size={16} />
            BERD ELITE
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
            Contributor <span className="gradient-text">Hall of Fame</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Celebrating the educators and students who fuel our knowledge ecosystem.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          {["students", "staff"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={cn(
                "px-8 py-3 rounded-2xl font-bold transition-all border",
                activeTab === t 
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20" 
                  : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10"
              )}
            >
              Top {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="glass-card p-6 flex items-center gap-6">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid gap-4"
              >
                {currentList.map((user, i) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6 flex items-center gap-6 group hover:border-blue-500/30 transition-all relative overflow-hidden"
                  >
                    {i < 3 && (
                      <div className={cn(
                        "absolute inset-0 opacity-5 pointer-events-none",
                        i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-300" : "bg-orange-500"
                      )} />
                    )}

                    <div className="w-12 text-center">
                      {i === 0 ? <Medal className="text-amber-500 mx-auto" size={28} /> :
                       i === 1 ? <Medal className="text-gray-300 mx-auto" size={28} /> :
                       i === 2 ? <Medal className="text-orange-500 mx-auto" size={28} /> :
                       <span className="text-xl font-black text-gray-700 font-mono">#{i + 1}</span>}
                    </div>

                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-colors bg-white/5">
                        <img 
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "Anonymous")}&background=6C63FF&color=fff&bold=true`}
                          alt={user.name || "Anonymous"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white truncate">{user.name || "Anonymous"}</h3>
                      </div>
                      <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                        {user.uploadCount || 0} CONTRIBUTIONS
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-white tracking-tighter">
                        {user.points?.toLocaleString() || 0}
                      </div>
                      <p className="text-[10px] font-mono text-blue-500 uppercase font-black tracking-widest">
                        SCORE
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
