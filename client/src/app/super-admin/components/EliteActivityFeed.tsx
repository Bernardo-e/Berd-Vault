"use client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  FileText, 
  Shield, 
  Zap, 
  Activity,
  Terminal
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface ActivityProps {
  activities: any[];
}

function getIcon(action: string) {
  if (action.includes("USER")) return <Users size={14} className="text-purple-400" />;
  if (action.includes("ROLE")) return <Zap size={14} className="text-amber-400" />;
  if (action.includes("NOTE")) return <FileText size={14} className="text-indigo-400" />;
  if (action.includes("ADMIN")) return <Shield size={14} className="text-blue-400" />;
  return <Activity size={14} className="text-gray-400" />;
}

function getIndicatorColor(action: string) {
  if (action.includes("DELETE") || action.includes("REJECT") || action.includes("BAN"))
    return "bg-rose-500";
  if (action.includes("APPROVE") || action.includes("CREATE"))
    return "bg-emerald-500";
  return "bg-indigo-500";
}

export default function EliteActivityFeed({ activities }: ActivityProps) {
  return (
    <div className="rounded-2xl border border-white/[0.04] bg-[#07070c]/50 flex flex-col h-full shadow-[0_4px_30px_rgba(0,0,0,0.4)] overflow-hidden">
      
      {/* ── Header ── */}
      <div className="p-5 border-b border-white/[0.04] flex justify-between items-center bg-[#0b0b12]">
        <div>
          <h3 className="text-xs font-mono font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            Live Activity Feed
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </h3>
          <p className="text-[9px] font-mono text-gray-500 tracking-wider mt-0.5">{activities.length} EVENTS IN FEED</p>
        </div>
      </div>

      {/* ── Feed Content ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar max-h-[460px]">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Terminal size={24} className="text-gray-800 mb-3" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600">No events logged</p>
            <p className="text-[9px] font-mono text-gray-700 mt-1">Platform activity is quiet</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activities.map((act, i) => (
              <motion.div
                key={act._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-[#07070c]/30 transition-all duration-200"
              >
                <div className="flex items-start gap-3.5">
                  {/* Action Icon Box */}
                  <div className="w-8 h-8 rounded-lg bg-black border border-white/5 flex items-center justify-center shrink-0">
                    {getIcon(act.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-white truncate font-sans">
                        {act.user?.name || "SYSTEM"}
                      </span>
                      <span className="text-[8.5px] font-mono text-gray-600 shrink-0 tabular-nums">
                        {timeAgo(act.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-400 leading-relaxed mt-1 font-sans">
                      {act.details}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-3.5">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-gray-500 bg-white/[0.02] border border-white/[0.03] px-2 py-0.5 rounded">
                        {act.action}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${getIndicatorColor(act.action)}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

    </div>
  );
}
