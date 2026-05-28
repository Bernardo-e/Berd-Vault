"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  MessageSquare,
  User,
  ShieldCheck,
  Send,
  X
} from "lucide-react";
import { moderatorAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

interface ReportsProps {
  reports: any[];
  onRefresh: () => void;
}

export default function ReportsTab({ reports, onRefresh }: ReportsProps) {
  const [warningReportId, setWarningReportId] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [submittingWarning, setSubmittingWarning] = useState(false);

  const handleStatus = async (id: string, status: string) => {
    try {
      await moderatorAPI.updateReport(id, status);
      toast.success(`REPORT DECK RESOLVED: ${status.toUpperCase()}`);
      onRefresh();
    } catch {
      toast.error("FAILED TO REGISTER RESOLUTION STATUS");
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await moderatorAPI.deleteReport(id);
      toast.success("COMPLAINT DISMISSED AND ERASED");
      onRefresh();
    } catch {
      toast.error("FAILED TO DISMISS COMPLAINT LOG");
    }
  };

  const handleDeleteContent = async (noteId: string, reportId: string) => {
    if (!confirm("⚠️ CRITICAL ACTION: This will delete the PDF catalog item and resolve the complaint. Confirm?")) return;
    try {
      await moderatorAPI.deleteNote(noteId);
      await moderatorAPI.updateReport(reportId, "reviewed");
      toast.success("CONTENT PURGED AND REPORT CLOSED");
      onRefresh();
    } catch {
      toast.error("FAILED TO PURGE VIOLATING CONTENT");
    }
  };

  const handleSendWarning = async (userId: string, reportId: string) => {
    if (!warningMessage.trim()) return;
    setSubmittingWarning(true);
    
    try {
      await moderatorAPI.warnUser(userId, warningMessage.trim());
      toast.success("WARNING NOTIFICATION DISPATCHED TO STUDENT");
      setWarningReportId(null);
      setWarningMessage("");
      // Mark report as reviewed after warning uploader
      await moderatorAPI.updateReport(reportId, "reviewed");
      onRefresh();
    } catch {
      toast.error("WARNING ROUTE FAILED TO TARGET RECIPIPIENT");
    } finally {
      setSubmittingWarning(false);
    }
  };

  const pendingReports = reports.filter(r => r.status === "pending");
  const reviewedReports = reports.filter(r => r.status !== "pending");

  return (
    <div className="space-y-8 relative">
      
      {/* Pending Reports Tribunal Section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500 animate-pulse" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">
            Pending Complaint Tribunal ({pendingReports.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {pendingReports.map((report) => (
              <motion.div 
                key={report._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="relative rounded-3xl border border-amber-500/10 bg-black/40 backdrop-blur-xl p-5 overflow-hidden transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_8px_32px_rgba(245,158,11,0.06)] group"
              >
                {/* Visual warning corner indicator */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] blur-xl pointer-events-none" />
                <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-gradient-to-b from-amber-500/50 via-transparent to-transparent" />

                <div className="flex justify-between items-start mb-4 relative z-10 font-mono">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-500 shrink-0 shadow-lg">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs uppercase tracking-wide">
                        {report.reason ? report.reason.replace("_", " ") : "FLAGGED UPLOAD"}
                      </h4>
                      <p className="text-[9px] text-gray-500 mt-0.5">{timeAgo(report.createdAt)}</p>
                    </div>
                  </div>

                  {/* Top quick action triggers */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatus(report._id, "dismissed")}
                      className="p-2 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
                      title="Dismiss Report"
                    >
                      <XCircle size={14} />
                    </button>
                    <button 
                      onClick={() => handleStatus(report._id, "reviewed")}
                      className="p-2 bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 rounded-xl text-gray-500 hover:text-emerald-400 transition-all"
                      title="Mark Reviewed"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Info Panel: Offending Note details */}
                <div className="rounded-2xl border border-white/[0.03] bg-black/40 p-4 mb-4 relative font-mono text-[10px]">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest">OFFENDING ARCHIVE</span>
                    {report.note && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${report.note.isApproved ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
                        {report.note.isApproved ? "APPROVED" : "PENDING"}
                      </span>
                    )}
                  </div>
                  
                  {report.note ? (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-white font-semibold font-sans text-xs truncate max-w-[280px]">
                        {report.note.title}
                      </p>
                      <p className="text-[8px] text-gray-500 uppercase">
                        SUBJECT: {report.note.subject} • BY: {report.note.uploader?.name || "ANONYMOUS"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600 italic">CATALOG ITEM PREVIOUSLY PURGED FROM SERVER</p>
                  )}
                </div>

                {/* Complaint Comments */}
                <div className="flex items-start gap-2.5 text-xs text-gray-400 font-sans border-b border-white/[0.04] pb-4 mb-4">
                  <MessageSquare size={13} className="mt-0.5 text-blue-400 shrink-0" />
                  <p className="italic leading-relaxed">"{report.comments || "No contextual comments provided by student."}"</p>
                </div>

                {/* Footer Core Actions */}
                <div className="flex items-center justify-between font-mono text-[9px] relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                      <User size={10} className="text-gray-400" />
                    </div>
                    <span className="text-gray-500 uppercase tracking-wide truncate max-w-[90px]" title={`Reported by ${report.reportedBy?.name || "Unknown"}`}>
                      BY: {report.reportedBy?.name || "STUDENT"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Inline Warn Dialogue Trigger */}
                    {report.note?.uploader && (
                      <button 
                        onClick={() => {
                          setWarningReportId(warningReportId === report._id ? null : report._id);
                          setWarningMessage("");
                        }}
                        className="px-3 py-2 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-gray-400 hover:text-white rounded-xl font-bold uppercase transition-all"
                      >
                        WARN UPLOADER
                      </button>
                    )}

                    {report.note && (
                      <button 
                        onClick={() => handleDeleteContent(report.note._id, report._id)}
                        className="px-3 py-2 bg-red-500/10 border border-red-500/15 text-red-400 hover:bg-red-500/20 rounded-xl font-bold uppercase transition-all flex items-center gap-1 shrink-0"
                      >
                        <Trash2 size={10} /> PURGE FILE
                      </button>
                    )}
                  </div>
                </div>

                {/* Embedded dynamic warning deck drawer */}
                <AnimatePresence>
                  {warningReportId === report._id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-4 pt-4 border-t border-white/[0.04] overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">SEND DIRECT WARNING INTEL</span>
                          <button onClick={() => setWarningReportId(null)} className="text-gray-600 hover:text-white p-0.5">
                            <X size={10} />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Enter citation or warning rules reason..."
                            value={warningMessage}
                            onChange={(e) => setWarningMessage(e.target.value)}
                            className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.03] transition-all font-mono"
                          />
                          <button 
                            onClick={() => handleSendWarning(report.note.uploader._id || report.note.uploader, report._id)}
                            disabled={submittingWarning || !warningMessage.trim()}
                            className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                          >
                            <Send size={10} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {pendingReports.length === 0 && (
          <div className="p-16 border border-white/[0.04] rounded-3xl bg-black/40 backdrop-blur-xl text-center text-gray-600 font-mono text-xs tracking-widest uppercase shadow-inner">
            SYSTEM RECORDS CLEAN. COMPLAINT LIST EMPTY.
          </div>
        )}
      </section>

      {/* Resolution History Section */}
      {reviewedReports.length > 0 && (
        <section className="pt-8 border-t border-white/[0.04] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-gray-500" />
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest font-mono">
              Resolution history logs
            </h3>
          </div>

          <div className="rounded-3xl border border-white/[0.04] bg-black/40 backdrop-blur-xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-[10px] border-collapse">
              <tbody className="divide-y divide-white/[0.02] font-mono text-gray-400">
                {reviewedReports.map((report) => (
                  <tr key={report._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4.5 flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${report.status === "dismissed" ? "bg-gray-600 shadow-[0_0_6px_rgba(75,85,99,0.5)]" : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"}`} />
                      <span className="text-white font-bold uppercase">{report.reason ? report.reason.replace("_", " ") : "COMPLAINT"}</span>
                    </td>
                    <td className="px-6 py-4.5 truncate max-w-[240px]">
                      {report.note?.title || "Note Deleted"}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono border ${
                        report.status === "dismissed" ? "text-gray-500 border-white/5 bg-white/[0.01]" : "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                      }`}>
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button 
                        onClick={() => handleDeleteReport(report._id)}
                        className="p-1 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete log"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
}
