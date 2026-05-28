"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  AlertTriangle, 
  Users, 
  LogOut, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { APP_NAME } from "@/lib/branding";

type Tab = "overview" | "pdfs" | "reports" | "users";

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onLogout: () => void;
}

const navItems = [
  { id: "overview", label: "Dashboard Intel", icon: LayoutDashboard, glow: "group-hover:text-blue-400" },
  { id: "pdfs", label: "PDF Moderation", icon: FileText, glow: "group-hover:text-cyan-400" },
  { id: "reports", label: "Report Tribunal", icon: AlertTriangle, glow: "group-hover:text-amber-400" },
  { id: "users", label: "Student Registry", icon: Users, glow: "group-hover:text-purple-400" },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  return (
    <aside className="fixed left-6 top-6 bottom-6 w-68 bg-black/60 border border-white/[0.04] backdrop-blur-2xl rounded-3xl z-50 flex flex-col p-6 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      {/* Interactive top decorative neon edge */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 mb-10 px-2 mt-2">
        <div className="relative">
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 blur-sm opacity-50 animate-pulse" />
          <div className="relative w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shadow-lg">
            <ShieldAlert className="text-blue-400" size={20} />
          </div>
        </div>
        <div>
          <h1 className="font-display font-black text-white text-sm tracking-wide uppercase">{APP_NAME}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
            <p className="text-[9px] text-blue-400/80 font-mono uppercase tracking-widest font-black">ADMINISTRATOR</p>
          </div>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 space-y-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full group flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl transition-all duration-300 relative ${
                isActive 
                  ? "text-white font-semibold" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="admin-active-pill"
                  className="absolute inset-0 bg-white/[0.04] border border-white/[0.04] rounded-xl shadow-inner pointer-events-none"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.div 
                  layoutId="admin-active-edge"
                  className="absolute left-0 w-[3px] h-6 bg-blue-500 rounded-r-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <Icon 
                size={18} 
                className={`transition-colors duration-300 relative z-10 ${
                  isActive ? "text-blue-400" : `text-gray-400 ${item.glow}`
                }`} 
              />
              <span className="text-xs font-mono uppercase tracking-wider relative z-10">{item.label}</span>
              
              <ChevronRight 
                size={12} 
                className={`ml-auto transition-all duration-300 relative z-10 ${
                  isActive ? "opacity-100 translate-x-0 rotate-90 text-blue-400" : "opacity-0 -translate-x-1 text-gray-500 group-hover:opacity-100 group-hover:translate-x-0"
                }`} 
              />
            </button>
          );
        })}
      </nav>

      {/* Footer System Clearance & Actions */}
      <div className="pt-6 border-t border-white/[0.04] mt-auto">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-300 group"
        >
          <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
          <span className="font-mono text-xs uppercase tracking-wider">TERMINATE_LINK</span>
        </button>
      </div>
    </aside>
  );
}
