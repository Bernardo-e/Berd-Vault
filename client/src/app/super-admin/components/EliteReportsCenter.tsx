"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, Ban, CheckCircle, FileX, Search, Trash2, XCircle, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

const severityColors: Record<string, { border: string; bg: string; text: string }> = {
  pending: { border: "border-amber-500/10", bg: "bg-amber-500/5", text: "text-amber-400" },
  reviewed: { border: "border-emerald-500/10", bg: "bg-emerald-500/5", text: "text-emerald-400" },
  dismissed: { border: "border-white/[0.04]", bg: "bg-white/[0.01]", text: "text-gray-400" },
};

export default function EliteReportsCenter({ reports, onRefresh }: { reports: any[]; onRefresh: () => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => reports.filter((report) => {
    const matchesStatus = status === "all" || report.status === status;
    const haystack = [report.reason, report.comments, report.note?.title, report.reportedBy?.name, report.reportedBy?.email].join(" ").toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  }), [reports, query, status]);

  const setReportStatus = async (id: string, next: string) => {
    try {
      await adminAPI.updateReport(id, next);
      toast.success(`Report marked as ${next}`);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Report action failed");
    }
  };

  const removeContent = async (report: any) => {
    if (!report.note?._id || !confirm("Remove the reported upload and resolve this report?")) return;
    try {
      await adminAPI.deleteNote(report.note._id);
      await adminAPI.updateReport(report._id, "reviewed");
      toast.success("Reported content removed");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Content removal failed");
    }
  };

  const warnUploader = async (report: any) => {
    const uploaderId = report.note?.uploader?._id;
    if (!uploaderId) return toast.error("Uploader unavailable");
    try {
      await adminAPI.warnUser(uploaderId, `Your upload "${report.note?.title}" has received a moderation warning.`);
      toast.success("Uploader warned");
    } catch {
      toast.error("Warning failed");
    }
  };

  const statusCounts = useMemo(() => ({
    all: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    reviewed: reports.filter(r => r.status === "reviewed").length,
    dismissed: reports.filter(r => r.status === "dismissed").length,
  }), [reports]);

  return (
    <div className="space-y-6">
      
      {/* ── Command Header ── */}
      <div className="p-6 rounded-2xl border border-white/[0.04] bg-[#07070c]/50 flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
            <ShieldAlert size={18} className="text-rose-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
              Reports Tribunal
            </h2>
            <p className="text-[9.5px] text-gray-500 font-sans mt-0.5">Platform incident logs & uploader warning controls</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Console */}
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reports..."
              className="bg-black/60 border border-white/[0.04] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-white/[0.12] transition-all w-full sm:w-52"
            />
          </div>
          {/* Status Filter */}
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="bg-black/60 border border-white/[0.04] rounded-xl px-4 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-white/[0.12] transition-all font-mono"
          >
            <option value="all">ALL ({statusCounts.all})</option>
            <option value="pending">PENDING ({statusCounts.pending})</option>
            <option value="reviewed">RESOLVED ({statusCounts.reviewed})</option>
            <option value="dismissed">DISMISSED ({statusCounts.dismissed})</option>
          </select>
        </div>
      </div>

      {/* ── Report Cards Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filtered.map((report) => {
          const colors = severityColors[report.status] || severityColors.dismissed;
          return (
            <article
              key={report._id}
              className={`relative rounded-2xl border ${colors.border} bg-[#07070c]/50 p-6 transition-all duration-300 hover:bg-[#07070c]/70 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border tracking-wide uppercase ${
                        report.status === "pending" 
                          ? "text-amber-400 border-amber-500/10 bg-amber-500/5" 
                          : "text-gray-500 border-white/5"
                      }`}>
                        {report.reason?.replace("_", " ") || "Incident"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate max-w-[280px] font-sans">
                      {report.note?.title || "Deleted document resource"}
                    </h3>
                    <p className="text-[9.5px] text-gray-500 mt-1 font-mono">
                      LOGGED BY // <span className="text-gray-400 font-bold">{report.reportedBy?.name || "SYSTEM"}</span> • {timeAgo(report.createdAt)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-[8.5px] font-mono font-bold uppercase tracking-wider ${colors.border} ${colors.bg} ${colors.text}`}>
                    {report.status}
                  </span>
                </div>

                {report.comments && (
                  <div className="mt-4 rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5">
                    <p className="text-[8px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-1.5">Incident Description</p>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">{report.comments}</p>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-white/[0.04]">
                <ActionBtn icon={CheckCircle} label="Resolve" onClick={() => setReportStatus(report._id, "reviewed")} color="emerald" />
                <ActionBtn icon={XCircle} label="Dismiss" onClick={() => setReportStatus(report._id, "dismissed")} color="gray" />
                <ActionBtn icon={FileX} label="Remove" onClick={() => removeContent(report)} color="rose" />
                <ActionBtn icon={Ban} label="Warn" onClick={() => warnUploader(report)} color="amber" />
                <ActionBtn icon={Trash2} label="Delete" onClick={() => adminAPI.deleteReport(report._id).then(onRefresh)} color="rose" />
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-white/[0.04] border-dashed bg-[#07070c]/20 p-16 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-gray-700 animate-pulse" />
          <h3 className="text-xs font-mono font-bold text-gray-600 uppercase tracking-widest">No matching report tickets found</h3>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, color }: { icon: any; label: string; onClick: () => void; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/25",
    rose: "border-rose-500/10 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/25",
    amber: "border-amber-500/10 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/25",
    gray: "border-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.03]",
  };
  return (
    <button onClick={onClick} className={`rounded-lg border px-2.5 py-1.5 text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 ${colorMap[color] || colorMap.gray}`}>
      <Icon size={12} />
      {label}
    </button>
  );
}
