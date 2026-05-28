"use client";
import React from "react";
import { 
  Users, 
  Upload, 
  ShieldCheck, 
  AlertCircle, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";

interface OverviewProps {
  stats: any;
  setActiveTab: (tab: any) => void;
}

export default function EliteOverviewDeck({ stats, setActiveTab }: OverviewProps) {
  const cards = [
    {
      key: "totalUsers",
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      trend: "+8.4% vs last week",
      trendType: "up",
      color: "from-indigo-500/10 to-blue-500/10",
      iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      glowColor: "rgba(99, 102, 241, 0.15)",
      tab: "users"
    },
    {
      key: "totalNotes",
      label: "Total Uploads",
      value: stats?.totalNotes || 0,
      icon: Upload,
      trend: "+14.2% vs last month",
      trendType: "up",
      color: "from-purple-500/10 to-violet-500/10",
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      glowColor: "rgba(168, 85, 247, 0.15)",
      tab: "content"
    },
    {
      key: "totalAdmins",
      label: "Active Admins",
      value: stats?.totalAdmins || 0,
      icon: ShieldCheck,
      trend: "Fully authorized Roster",
      trendType: "neutral",
      color: "from-blue-500/10 to-sky-500/10",
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      glowColor: "rgba(59, 130, 246, 0.15)",
      tab: "requests"
    },
    {
      key: "pendingReports",
      label: "Reports Pending",
      value: stats?.pendingReports || 0,
      icon: AlertCircle,
      trend: stats?.pendingReports > 0 ? "Moderation required" : "Matrix is secure",
      trendType: stats?.pendingReports > 0 ? "down" : "neutral",
      color: "from-rose-500/10 to-red-500/10",
      iconColor: stats?.pendingReports > 0 ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : "text-gray-400 bg-gray-500/5 border-white/[0.04]",
      glowColor: stats?.pendingReports > 0 ? "rgba(244, 63, 94, 0.15)" : "rgba(255, 255, 255, 0.05)",
      tab: "reports"
    },
    {
      key: "activeUsers",
      label: "Active Users Today",
      value: stats?.activeUsers || 0,
      icon: Activity,
      trend: "+5.1% peak engagement",
      trendType: "up",
      color: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      glowColor: "rgba(16, 185, 129, 0.15)",
      tab: "analytics"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            onClick={() => setActiveTab(card.tab)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.04] bg-[#07070c]/50 p-5 transition-all duration-300 hover:border-white/[0.08] hover:bg-[#07070c]/70 flex flex-col justify-between min-h-[145px]"
            style={{
              boxShadow: `0 4px 30px rgba(0, 0, 0, 0.4)`
            }}
            whileHover={{ 
              y: -4,
              boxShadow: `0 12px 30px -10px ${card.glowColor}`
            }}
          >
            {/* Ambient subtle glow background overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none`} />

            <div className="flex items-start justify-between relative z-10">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black group-hover:text-gray-400 transition-colors">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 ${card.iconColor}`}>
                <Icon size={15} />
              </div>
            </div>

            <div className="mt-4 relative z-10">
              <h3 className="text-3xl font-extrabold text-white tracking-tight font-sans">
                {card.value.toLocaleString()}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-[9px] font-medium font-mono">
                {card.trendType === "up" && (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <ArrowUpRight size={10} />
                  </span>
                )}
                {card.trendType === "down" && (
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <ArrowDownRight size={10} />
                  </span>
                )}
                <span className={card.trendType === "up" ? "text-emerald-400/80" : card.trendType === "down" ? "text-rose-400/80" : "text-gray-500"}>
                  {card.trend}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
