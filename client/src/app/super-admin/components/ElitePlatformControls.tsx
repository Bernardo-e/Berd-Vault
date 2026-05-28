"use client";
import { Bell, Lock, Megaphone, ShieldCheck, SlidersHorizontal, Upload, Zap, Pin, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

const controlsMeta = [
  ["maintenanceMode", "Maintenance Mode", "Locks platform routing and gates user logins under standard maintenance states.", Lock, "amber"],
  ["studentUploadsEnabled", "Student Uploads Flow", "Allow students to upload new study documents and resource notes.", Upload, "indigo"],
  ["staffAnnouncementsEnabled", "Staff Announcements", "Permits verified staff accounts to broadcast platform bulletins.", Megaphone, "purple"],
  ["examModeBoostEnabled", "Exam Mode Boost", "Applies global priority overrides to support exam revision periods.", Zap, "blue"],
  ["autoApproveStaffUploads", "Auto-Approve Staff Documents", "Instantly flags staff uploads as approved and verified nodes.", ShieldCheck, "emerald"],
];

const accentMap: Record<string, { on: string; off: string; icon: string; border: string }> = {
  amber: { on: "bg-amber-500/5", off: "bg-white/[0.01]", icon: "text-amber-400 border-amber-500/10 bg-amber-500/5", border: "border-amber-500/20" },
  indigo: { on: "bg-indigo-500/5", off: "bg-white/[0.01]", icon: "text-indigo-400 border-indigo-500/10 bg-indigo-500/5", border: "border-indigo-500/20" },
  purple: { on: "bg-purple-500/5", off: "bg-white/[0.01]", icon: "text-purple-400 border-purple-500/10 bg-purple-500/5", border: "border-purple-500/20" },
  blue: { on: "bg-blue-500/5", off: "bg-white/[0.01]", icon: "text-blue-400 border-blue-500/10 bg-blue-500/5", border: "border-blue-500/20" },
  emerald: { on: "bg-emerald-500/5", off: "bg-white/[0.01]", icon: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5", border: "border-emerald-500/20" },
};

export default function ElitePlatformControls({ controls, announcements, onRefresh }: { controls: any; announcements: any[]; onRefresh: () => void }) {
  
  const toggleControl = async (key: string) => {
    try {
      await adminAPI.updateControls({ [key]: !controls?.[key] });
      toast.success("Configuration updated successfully");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Control update failed");
    }
  };

  const toggleAnnouncement = async (announcement: any) => {
    try {
      await adminAPI.updateAnnouncement(announcement._id, { isPinned: !announcement.isPinned });
      toast.success("Broadcast status updated");
      onRefresh();
    } catch {
      toast.error("Announcement update failed");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ── Master Switch Swivel Center ── */}
      <div className="p-6 rounded-2xl border border-white/[0.04] bg-[#07070c]/50 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
            <SlidersHorizontal className="text-indigo-400" size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
              Platform Switchboard Control
            </h2>
            <p className="text-[9.5px] text-gray-500 font-sans mt-0.5">Configure platform routing parameters & global user scopes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {controlsMeta.map(([key, label, description, Icon, color]: any) => {
            const isActive = controls?.[key];
            const accent = accentMap[color] || accentMap.indigo;
            return (
              <button
                key={key}
                onClick={() => toggleControl(key)}
                className={`group relative rounded-2xl border p-5 text-left transition-all duration-300 ${
                  isActive
                    ? `${accent.border} ${accent.on}`
                    : "border-white/[0.04] bg-black/40 hover:bg-white/[0.01]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`rounded-xl border p-3 transition-all duration-300 ${
                      isActive ? `${accent.icon}` : "border-white/5 bg-white/[0.01] text-gray-500"
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-xs tracking-tight font-sans">
                        {label}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-500 leading-relaxed font-sans">{description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3.5 shrink-0 self-start mt-0.5">
                    {isActive ? (
                      <ToggleRight size={24} className="text-emerald-400 transition-colors" />
                    ) : (
                      <ToggleLeft size={24} className="text-gray-600 transition-colors" />
                    )}
                    <span className={`rounded-lg border px-2 py-0.5 text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "border-emerald-500/10 bg-emerald-500/5 text-emerald-400"
                        : "border-rose-500/10 bg-rose-500/5 text-rose-400"
                    }`}>
                      {isActive ? "ACTIVE" : "STANDBY"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Global Announcement Governance ── */}
      <div className="p-6 rounded-2xl border border-white/[0.04] bg-[#07070c]/50 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
            <Bell className="text-purple-400" size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
              Global Bulletins Broadcast
            </h2>
            <p className="text-[9.5px] text-gray-500 font-sans mt-0.5">Manage, pin, or revoke public dashboard notifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {announcements.slice(0, 8).map((announcement) => (
            <article
              key={announcement._id}
              className="group relative rounded-2xl border border-white/[0.04] bg-[#07070c]/30 p-5 transition-all duration-300 hover:bg-[#07070c]/50 hover:border-white/[0.08]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-white text-xs uppercase tracking-tight line-clamp-1 font-sans">{announcement.title}</p>
                  <p className="text-[8.5px] text-gray-500 mt-1 font-mono uppercase font-bold">
                    AUTHOR // <span className="text-purple-400 font-bold">{announcement.postedBy?.name || "SYSTEM"}</span> • {timeAgo(announcement.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {announcement.isPinned && (
                    <div className="w-5 h-5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Pin size={10} className="text-purple-400" />
                    </div>
                  )}
                  <span className="text-[8.5px] font-mono uppercase text-purple-400 font-bold tracking-wider bg-purple-500/5 border border-purple-500/10 px-2 py-0.5 rounded">{announcement.type}</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400 line-clamp-2 leading-relaxed font-sans">{announcement.content}</p>

              <div className="mt-4 flex gap-2 pt-3 border-t border-white/[0.03]">
                <button
                  onClick={() => toggleAnnouncement(announcement)}
                  className="rounded-lg border border-white/[0.04] px-3.5 py-1.5 text-[8.5px] font-mono font-bold uppercase tracking-wider text-gray-300 hover:bg-white/[0.03] hover:text-white transition-all duration-200"
                >
                  {announcement.isPinned ? "📌 Unpin Bulletin" : "📌 Pin Bulletin"}
                </button>
                <button
                  onClick={() => adminAPI.deleteAnnouncement(announcement._id).then(onRefresh)}
                  className="rounded-lg border border-rose-500/10 px-3.5 py-1.5 text-[8.5px] font-mono font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/25 transition-all duration-200 flex items-center gap-1.5"
                >
                  <Trash2 size={11} />
                  Purge Broadcast
                </button>
              </div>
            </article>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="rounded-2xl border border-white/[0.04] border-dashed p-12 text-center mt-4">
            <Bell size={24} className="mx-auto mb-2 text-gray-700" />
            <p className="text-[10px] font-mono font-bold text-gray-600 uppercase tracking-widest">No active broadcast feeds detected</p>
          </div>
        )}
      </div>

    </div>
  );
}
