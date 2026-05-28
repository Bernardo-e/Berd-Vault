"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, FileText, GraduationCap, LayoutDashboard, LogOut, Megaphone, Settings, Target } from "lucide-react";
import { APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

interface StaffSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "uploads", label: "PDF Management", icon: FileText },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "engagement", label: "Engagement", icon: Target },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "profile", label: "Profile Settings", icon: Settings },
];

export default function StaffSidebar({ activeTab, setActiveTab, onLogout }: StaffSidebarProps) {
  return (
    <aside className="w-full lg:w-72 lg:fixed lg:left-0 lg:top-0 lg:bottom-0 z-40 bg-[#070711]/95 border-r border-white/10 backdrop-blur-xl">
      <div className="flex lg:h-full flex-col">
        <div className="p-5 lg:p-7 border-b border-white/10">
          <Link
            href="/dashboard"
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] transition hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/10 hover:text-white"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center shadow-glow">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-black text-white">Staff Portal</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{APP_NAME}</p>
            </div>
          </div>
        </div>

        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible p-4 lg:flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-[#6C63FF]/20 text-white border border-[#6C63FF]/35"
                    : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white border border-transparent"
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:block p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
