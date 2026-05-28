"use client";
import { motion } from "framer-motion";
import { 
  Cpu, 
  Activity, 
  BarChart3, 
  Users, 
  Database, 
  LogOut,
  Zap,
  LayoutDashboard,
  ClipboardList,
  SlidersHorizontal,
  X,
  Shield,
  Lock
} from "lucide-react";

type Tab = "overview" | "analytics" | "activity" | "users" | "requests" | "content" | "reports" | "controls";

interface EliteSidebarProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview Deck", icon: LayoutDashboard, color: "text-indigo-400" },
  { id: "requests", label: "Admin Requests", icon: Zap, color: "text-purple-400" },
  { id: "users", label: "User Clearance", icon: Users, color: "text-blue-400" },
  { id: "content", label: "Content Control", icon: Database, color: "text-indigo-400" },
  { id: "reports", label: "Reports Tribunal", icon: ClipboardList, color: "text-rose-400" },
  { id: "analytics", label: "Performance Analytics", icon: BarChart3, color: "text-sky-400" },
  { id: "activity", label: "System Log Stream", icon: Activity, color: "text-emerald-400" },
  { id: "controls", label: "Sovereignty Controls", icon: SlidersHorizontal, color: "text-violet-400" },
];

export default function EliteSidebar({ activeTab, setActiveTab, onLogout, sidebarOpen, setSidebarOpen }: EliteSidebarProps) {
  return (
    <aside className={`fixed lg:left-6 lg:top-6 lg:bottom-6 w-76 bg-[#07070c]/70 border border-white/[0.05] rounded-3xl backdrop-blur-3xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] z-50 flex flex-col p-6 overflow-hidden transition-all duration-300 ${
      sidebarOpen ? "left-6 top-6 bottom-6" : "-left-96 lg:left-6"
    }`}>
      
      {/* Background Soft Ambient Node */}
      <div className="absolute top-[-10%] left-[-10%] w-44 h-44 bg-indigo-600/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Mobile Close Button */}
      <button 
        onClick={() => setSidebarOpen(false)}
        className="lg:hidden absolute top-4 right-4 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors z-10"
      >
        <X size={15} />
      </button>

      {/* Cinematic Logo Section */}
      <div className="relative mb-8 mt-2">
        <div className="flex items-center gap-3.5 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Cpu className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-white tracking-tight text-base leading-none">BERD <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">VAULT</span></h1>
            <p className="text-[7.5px] text-gray-500 font-mono uppercase tracking-[0.25em] mt-1.5 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              SUPER ADMIN CONSOLE
            </p>
          </div>
        </div>
      </div>

      {/* Security Status Block */}
      <div className="mb-6 p-4 rounded-2xl border border-white/[0.04] bg-white/[0.01] relative overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black">Sovereign Gate</span>
          <span className="text-[8px] font-mono text-indigo-400 font-black uppercase tracking-widest flex items-center gap-1">
            <Lock size={9} /> Level 5 Clearance
          </span>
        </div>
        <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
        </div>
        <div className="flex justify-between items-center mt-2 text-[7.5px] text-gray-600 font-mono">
          <span>SEC_SESSION // ONLINE</span>
          <span className="text-emerald-400 font-bold">STABLE SYNC</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full group flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                isActive 
                  ? "text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/[0.02] border-transparent"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-highlight"
                  className="absolute inset-0 bg-white/[0.03] rounded-xl border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute left-0 w-[3px] h-5 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <Icon size={16} className={`transition-all duration-300 ${isActive ? item.color : "group-hover:text-gray-200 text-gray-400"}`} />
              
              <span className="font-bold text-[10.5px] tracking-wide text-left">{item.label}</span>
              
              {isActive && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-auto"
                >
                  <div className="w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)] animate-pulse" />
                </motion.div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer User Profile & Logout */}
      <div className="pt-4 border-t border-white/[0.05] mt-auto space-y-3">
        <div className="relative rounded-2xl bg-white/[0.01] border border-white/[0.03] p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px]">
              <div className="w-full h-full bg-[#05050a] rounded-[7px] flex items-center justify-center text-[9px] font-black text-indigo-400 font-mono">SA</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-white truncate font-sans">Super Administrator</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-[7.5px] text-gray-500 font-mono uppercase font-black">LINK SECURE</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 transition-all duration-200 font-bold text-[9px] uppercase tracking-wider"
        >
          <LogOut size={13} />
          Revoke Access Session
        </button>
      </div>
    </aside>
  );
}
