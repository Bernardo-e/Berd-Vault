"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Users, 
  Download, 
  Zap, 
  TrendingUp, 
  Clock,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Award
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface OverviewProps {
  stats: any;
}

const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
} as const;

const fadeUpItem = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } }
} as const;

export default function OverviewTab({ stats }: OverviewProps) {
  const cards = [
    { 
      label: "Total Database PDFs", 
      value: stats?.totalNotes || 0, 
      icon: FileText, 
      glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]", 
      border: "hover:border-blue-500/20", 
      iconColor: "text-blue-400", 
      bg: "bg-blue-400/5" 
    },
    { 
      label: "Active Student Registries", 
      value: stats?.activeStudents || 0, 
      icon: Users, 
      glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]", 
      border: "hover:border-purple-500/20", 
      iconColor: "text-purple-400", 
      bg: "bg-purple-400/5" 
    },
    { 
      label: "Accumulated Downloads", 
      value: stats?.totalDownloads || 0, 
      icon: Download, 
      glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]", 
      border: "hover:border-emerald-500/20", 
      iconColor: "text-emerald-400", 
      bg: "bg-emerald-400/5" 
    },
    { 
      label: "Exam Mode Prioritized", 
      value: stats?.examModeNotes || 0, 
      icon: Zap, 
      glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]", 
      border: "hover:border-amber-500/20", 
      iconColor: "text-amber-400", 
      bg: "bg-amber-400/5" 
    },
  ];

  // Calculate highest download to render relative heights in custom telemetry chart
  const maxDownloads = stats?.trendingSubjects?.length > 0 
    ? Math.max(...stats.trendingSubjects.map((s: any) => s.downloads)) 
    : 1;

  return (
    <motion.div 
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Dynamic Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div 
            key={idx}
            variants={fadeUpItem}
            className={`relative rounded-3xl border border-white/[0.04] bg-black/40 backdrop-blur-xl p-6 transition-all duration-500 group overflow-hidden ${card.border} ${card.glow}`}
          >
            {/* Interior accent gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] via-transparent to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.iconColor} border border-white/[0.02]`}>
                <card.icon size={20} />
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full font-bold">
                +14.8%
              </span>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-white tracking-tight font-display">{card.value}</h3>
              <p className="text-gray-500 text-xs font-mono uppercase tracking-wider mt-1">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Visualization and Trending Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Traffic Telemetry */}
        <motion.div variants={fadeUpItem} className="lg:col-span-2 rounded-3xl border border-white/[0.04] bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.01] to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                Subject Distribution Analytics
              </h3>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">HISTORICAL ACADEMIC DOWNLOAD RATIOS</p>
            </div>
          </div>

          {/* Gorgeous Lightweight SVG Custom Bar Telemetry */}
          <div className="h-64 flex items-end gap-6 px-4 pt-4 border-b border-white/[0.04] relative">
            {stats?.trendingSubjects && stats.trendingSubjects.length > 0 ? (
              stats.trendingSubjects.map((item: any, idx: number) => {
                const ratio = item.downloads / maxDownloads;
                const heightPercentage = Math.max(ratio * 85, 12); // minimum height to look nice
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group cursor-pointer relative">
                    {/* Hover indicator tooltip */}
                    <div className="absolute top-0 bg-black/90 border border-white/10 px-2 py-1 rounded-md text-[9px] font-mono text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none tracking-wider shadow-xl z-20">
                      {item.downloads} DN
                    </div>

                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercentage}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 }}
                      className="w-full rounded-t-xl bg-gradient-to-t from-blue-600/30 via-blue-500/50 to-purple-500/60 border border-blue-400/20 group-hover:brightness-125 transition-all duration-300 relative"
                    >
                      {/* Neon top cap glow */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] rounded-t-full" />
                    </motion.div>
                    
                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[80px] text-center transition-colors group-hover:text-blue-400">
                      {item.subject}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 font-mono text-xs">
                NO SUBJECT DATA COLLECTED
              </div>
            )}
          </div>
        </motion.div>

        {/* Most Downloaded Roster */}
        <motion.div variants={fadeUpItem} className="lg:col-span-1 rounded-3xl border border-white/[0.04] bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.01] to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-purple-400" />
                Apex Performers
              </h3>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">MOST DOWNLOADED NOTES INTEL</p>
            </div>
          </div>

          <div className="space-y-4">
            {stats?.mostDownloaded && stats.mostDownloaded.length > 0 ? (
              stats.mostDownloaded.map((note: any, idx: number) => (
                <div 
                  key={note._id} 
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.03] transition-colors relative"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-mono text-purple-400 font-black">#0{idx + 1}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{note.title}</h4>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5 truncate uppercase">
                      BY {note.uploader?.name || "ANONYMOUS"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">{note.downloads}</span>
                    <span className="text-[7px] font-mono text-gray-600 tracking-wider">DOWNLOADS</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-600 font-mono text-xs">
                NO UPLOAD RECORDS FOUND
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Upload Log Feed */}
      <motion.div variants={fadeUpItem} className="rounded-3xl border border-white/[0.04] bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.01] to-transparent pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" />
              Incoming PDF Stream feed
            </h3>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">REAL-TIME INGESTION LOGS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.recentUploads && stats.recentUploads.length > 0 ? (
            stats.recentUploads.map((note: any) => (
              <div 
                key={note._id} 
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.03] hover:border-blue-500/10 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-lg">
                  <FileText size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                    {note.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/[0.02] text-[8px] text-gray-400 font-mono uppercase">
                      {note.subject}
                    </span>
                    <span className="text-[8px] text-gray-600 font-mono">•</span>
                    <span className="text-[9px] text-gray-500 font-mono">
                      {timeAgo(note.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-mono text-gray-400 font-bold max-w-[80px] truncate">{note.uploader?.name}</p>
                    <p className="text-[7px] font-mono text-gray-600 truncate max-w-[80px]">{note.uploader?.email}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 p-12 text-center text-gray-600 font-mono text-xs">
              NO RECENT PDFS INGESTED
            </div>
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}
