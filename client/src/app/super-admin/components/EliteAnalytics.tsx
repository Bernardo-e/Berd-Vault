"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Upload, 
  Zap, 
  Layers,
  ArrowUpRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Cell
} from "recharts";

interface EliteAnalyticsProps {
  stats: any;
}

const COLORS = ["#6366f1", "#a855f7", "#3b82f6", "#10b981", "#f59e0b"];

export default function EliteAnalytics({ stats }: EliteAnalyticsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = stats?.chartData || [];
  const departmentData = stats?.departmentData || [];
  
  // Custom elegant tooltip component for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b0b12] border border-white/[0.08] p-3.5 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold mb-1.5">{label}</p>
          <div className="space-y-1.5">
            {payload.map((pld: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 justify-between">
                <span className="text-[10px] text-gray-400 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pld.color }} />
                  {pld.name}
                </span>
                <span className="text-[10px] font-mono text-white font-extrabold">
                  {pld.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* ── Top Grid Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "User Acquisition", value: stats?.totalUsers || 0, icon: Users, desc: "Active network nodes registered", color: "text-indigo-400" },
          { label: "Content Shards", value: stats?.totalNotes || 0, icon: Upload, desc: "Total database documents uploaded", color: "text-purple-400" },
          { label: "Neural Interactions", value: stats?.totalEngagement || 0, icon: Zap, desc: "Aggregated link & rating triggers", color: "text-emerald-400" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="relative p-6 rounded-2xl bg-[#07070c]/50 border border-white/[0.04] flex items-center justify-between"
            >
              <div>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold">
                  {item.label}
                </span>
                <h4 className="text-3xl font-extrabold text-white mt-1.5 tracking-tight font-sans">
                  {item.value.toLocaleString()}
                </h4>
                <p className="text-[9.5px] text-gray-500 mt-1 font-sans">{item.desc}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center ${item.color}`}>
                <Icon size={18} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Main Charts Sector ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* User Growth Area Chart */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-[#07070c]/50 border border-white/[0.04] flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        >
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-sans">User Growth Rate</h3>
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-1">Acquisition patterns mapped over 7 days</p>
            </div>
            <span className="text-[8.5px] font-mono text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-1 rounded-md font-bold flex items-center gap-1">
              <ArrowUpRight size={10} /> +8.4% growth
            </span>
          </div>

          <div className="h-[260px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.15)"
                    tick={{ fill: "#4b5563", fontSize: 8.5, fontWeight: 700, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.15)" 
                    tick={{ fill: "#4b5563", fontSize: 8.5, fontWeight: 700, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
                  <Area type="monotone" name="Total Signups" dataKey="users" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#userGrowthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-white/[0.01] animate-pulse rounded-xl border border-white/[0.04]" />
            )}
          </div>
        </motion.section>

        {/* Uploads Activity Bar Chart */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-[#07070c]/50 border border-white/[0.04] flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        >
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-sans">Document Upload Activity</h3>
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-1">Platform upload trends over 7 days</p>
            </div>
            <span className="text-[8.5px] font-mono text-purple-400 bg-purple-500/5 border border-purple-500/10 px-2 py-1 rounded-md font-bold flex items-center gap-1">
              <ArrowUpRight size={10} /> +12.1% uploads
            </span>
          </div>

          <div className="h-[260px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.15)"
                    tick={{ fill: "#4b5563", fontSize: 8.5, fontWeight: 700, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.15)" 
                    tick={{ fill: "#4b5563", fontSize: 8.5, fontWeight: 700, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.01)" }} />
                  <Bar name="New Uploads" dataKey="uploads" radius={[5, 5, 0, 0]}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#818cf8" : "#a78bfa"} className="hover:brightness-110 transition-all duration-300" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-white/[0.01] animate-pulse rounded-xl border border-white/[0.04]" />
            )}
          </div>
        </motion.section>

      </div>

      {/* ── Secondary Charts Sector ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Engagement Analytics Area Chart */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-3 p-6 rounded-2xl bg-[#07070c]/50 border border-white/[0.04] flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        >
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-sans">Ecosystem Engagement Metrics</h3>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-1">Views, Downloads, & rating links activity stream</p>
          </div>

          <div className="h-[210px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="engageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.15)"
                    tick={{ fill: "#4b5563", fontSize: 8.5, fontWeight: 700, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.15)" 
                    tick={{ fill: "#4b5563", fontSize: 8.5, fontWeight: 700, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)" }} />
                  <Area type="monotone" name="Ecosystem Views" dataKey="views" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#engageGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-white/[0.01] animate-pulse rounded-xl border border-white/[0.04]" />
            )}
          </div>
        </motion.section>

        {/* Active Department Metrics */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="xl:col-span-2 p-6 rounded-2xl bg-[#07070c]/50 border border-white/[0.04] flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        >
          <div>
            <div className="mb-5 flex items-center gap-2">
              <Layers size={15} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-sans">Active Departments</h3>
            </div>
            <p className="text-[9.5px] text-gray-500 font-sans mb-5">Resource density and active nodes across primary courses</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {departmentData.slice(0, 4).map((d: any, i: number) => {
              const percentages = departmentData.length > 0 ? (d.value / Math.max(...departmentData.map((x: any) => x.value))) * 100 : 0;
              return (
                <div key={i} className="group cursor-pointer">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1.5 font-bold">
                    <span className="uppercase group-hover:text-white transition-colors">{d.name}</span>
                    <span className="text-white">{d.value} notes</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[0.5px]">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${percentages}%`,
                        backgroundColor: COLORS[i % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

      </div>

    </div>
  );
}
