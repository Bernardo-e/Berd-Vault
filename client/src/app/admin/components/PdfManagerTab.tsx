"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Tag, 
  Check,
  FileText,
  ChevronDown,
  X,
  ShieldCheck,
  Sparkles,
  Zap,
  Globe,
  Award
} from "lucide-react";
import { moderatorAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

interface PdfManagerProps {
  notes: any[];
  onRefresh: () => void;
}

export default function PdfManagerTab({ notes, onRefresh }: PdfManagerProps) {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  
  // Metadata Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editApproved, setEditApproved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic filter sets
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.uploader?.name.toLowerCase().includes(search.toLowerCase()) ||
                          n.subject.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === "all" || n.department === filterDept;
    const matchesTag = filterTag === "all" || n.priority === filterTag;
    
    return matchesSearch && matchesDept && matchesTag;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ WARNING: This will permanently erase this PDF catalog. Proceed?")) return;
    try {
      await moderatorAPI.deleteNote(id);
      toast.success("PDF PURGED FROM DATABASE");
      onRefresh();
    } catch {
      toast.error("PURGE ACTION ENCOUNTERED CRITICAL ERROR");
    }
  };

  const handlePriority = async (id: string, priority: string) => {
    try {
      await moderatorAPI.tagNote(id, priority);
      toast.success(`PDF STATUS RECLASSIFIED: ${priority.toUpperCase()}`);
      onRefresh();
    } catch {
      toast.error("FAILED TO CHANGE PRIORITIZATION STATUS");
    }
  };

  const openEditModal = (note: any) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditSubject(note.subject);
    setEditDept(note.department);
    setEditApproved(note.isApproved);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingNote(null);
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    setSubmitting(true);

    try {
      await moderatorAPI.updateNote(editingNote._id, {
        title: editTitle,
        subject: editSubject,
        department: editDept,
        isApproved: editApproved
      });
      toast.success("PDF INTEL DECK METADATA UPDATED");
      closeEditModal();
      onRefresh();
    } catch {
      toast.error("UPDATE ROUTE REJECTED METADATA SHIFT");
    } finally {
      setSubmitting(false);
    }
  };

  // Rendering tags matching design specifications
  const renderPriorityBadge = (p: string) => {
    switch (p) {
      case "important":
        return <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400">IMPORTANT</span>;
      case "exam_priority":
        return <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">EXAM PRIORITY</span>;
      case "trending":
        return <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">TRENDING</span>;
      case "official":
        return <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">OFFICIAL</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-white/5 border border-white/5 text-gray-500">STANDARD</span>;
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Moderation Controls Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Dynamic Search Ingestion */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search by note title, subject, or uploader name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.04] backdrop-blur-xl rounded-2xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.02] focus:shadow-[0_0_20px_rgba(59,130,246,0.06)] transition-all font-mono"
          />
        </div>

        {/* Dynamic Dropdown Filters */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <select 
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full sm:w-auto bg-black/40 border border-white/[0.04] backdrop-blur-xl rounded-2xl py-3 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-blue-500/30 appearance-none transition-all cursor-pointer font-mono"
            >
              <option value="all">DEPARTMENTS (ALL)</option>
              <option value="CSE">CSE (COMPUTERS)</option>
              <option value="ECE">ECE (ELECTRONICS)</option>
              <option value="MECH">MECH (MECHANICAL)</option>
              <option value="CIVIL">CIVIL (ENGINEERING)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
          </div>

          <div className="relative flex-1 sm:flex-none">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <select 
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full sm:w-auto bg-black/40 border border-white/[0.04] backdrop-blur-xl rounded-2xl py-3 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-blue-500/30 appearance-none transition-all cursor-pointer font-mono"
            >
              <option value="all">PRIORITIES (ALL)</option>
              <option value="none">STANDARD ONLY</option>
              <option value="important">IMPORTANT DECK</option>
              <option value="exam_priority">EXAM REVISIONS</option>
              <option value="trending">TRENDING FILES</option>
              <option value="official">OFFICIAL ARCHIVE</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Main Database Table */}
      <div className="rounded-3xl border border-white/[0.04] bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-white/[0.01] text-gray-500 font-mono text-[9px] uppercase tracking-widest border-b border-white/[0.04]">
              <tr>
                <th className="px-6 py-4.5">File Details</th>
                <th className="px-6 py-4.5">Dept / Subject</th>
                <th className="px-6 py-4.5">Uploader</th>
                <th className="px-6 py-4.5">Tagging / Priority</th>
                <th className="px-6 py-4.5">Status Check</th>
                <th className="px-6 py-4.5 text-right">Operation Deck</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] font-mono">
              {filteredNotes.map((note) => (
                <motion.tr 
                  key={note._id}
                  layout
                  className="hover:bg-white/[0.01] transition-all group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold truncate max-w-[200px] text-xs font-sans group-hover:text-blue-400 transition-colors">
                          {note.title}
                        </div>
                        <div className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-wide">
                          {note.year} YEAR • #{note._id?.slice(-5)}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-gray-300 font-bold uppercase">{note.department || "GEN"}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 uppercase truncate max-w-[120px]">{note.subject}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-gray-300 truncate max-w-[120px] font-sans font-medium">{note.uploader?.name || "ANONYMOUS"}</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">{note.uploader?.email || "N/A"}</div>
                  </td>

                  <td className="px-6 py-4">
                    {renderPriorityBadge(note.priority)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${note.isApproved ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]"}`} />
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">{note.isApproved ? "APPROVED" : "PENDING"}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      {/* Interactive tag dropdown trigger */}
                      <div className="relative group/tag">
                        <button className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-gray-500 hover:text-cyan-400 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all">
                          <Tag size={13} />
                        </button>
                        
                        <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 border border-white/[0.06] backdrop-blur-2xl rounded-2xl hidden group-hover/tag:block z-50 p-2 shadow-2xl">
                          <div className="px-3 py-1.5 text-[8px] font-bold text-gray-600 tracking-widest uppercase border-b border-white/[0.04] mb-1">
                            CLASSIFY DOCUMENT
                          </div>
                          {[
                            { id: "none", icon: Globe, label: "STANDARD" },
                            { id: "important", icon: ShieldCheck, label: "IMPORTANT" },
                            { id: "exam_priority", icon: Zap, label: "EXAM MODE" },
                            { id: "trending", icon: Sparkles, label: "TRENDING" },
                            { id: "official", icon: Award, label: "OFFICIAL" },
                          ].map((p) => {
                            const TIcon = p.icon;
                            return (
                              <button 
                                key={p.id}
                                onClick={() => handlePriority(note._id, p.id)}
                                className={`w-full text-left px-2.5 py-2 rounded-xl text-[9px] font-bold uppercase transition-colors flex items-center justify-between ${
                                  note.priority === p.id ? "bg-blue-500/10 text-blue-400" : "text-gray-500 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <TIcon size={10} />
                                  <span>{p.label}</span>
                                </div>
                                {note.priority === p.id && <Check size={10} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Launch metadata modal */}
                      <button 
                        onClick={() => openEditModal(note)}
                        className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-gray-500 hover:text-blue-400 hover:border-blue-500/20 hover:bg-blue-500/5 transition-all"
                        title="Edit PDF Metadata"
                      >
                        <Edit3 size={13} />
                      </button>

                      {/* Delete notes */}
                      <button 
                        onClick={() => handleDelete(note._id)}
                        className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-gray-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all"
                        title="Purge Document"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredNotes.length === 0 && (
          <div className="p-16 text-center text-gray-600 font-mono text-xs tracking-widest uppercase">
            NO PDF METRICS INGESTED MATCHING QUERY
          </div>
        )}
      </div>

      {/* ─── PREMIUM GLASS METADATA EDITOR MODAL ─── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Dark glass backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            {/* Modal Body Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-lg bg-black/75 border border-white/[0.05] backdrop-blur-2xl rounded-3xl p-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10"
            >
              {/* Decorative top ambient light glow */}
              <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center gap-2">
                    <Edit3 size={16} className="text-blue-400" />
                    Modify PDF Catalog Intel
                  </h3>
                  <p className="text-[8px] text-gray-500 font-mono mt-0.5">UPDATE METADATA FOR NODE #{editingNote?._id?.slice(-8)}</p>
                </div>
                <button 
                  onClick={closeEditModal}
                  className="p-2 hover:bg-white/5 border border-transparent hover:border-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSaveMetadata} className="space-y-5 font-mono text-xs">
                {/* Form fields */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Document Title</label>
                  <input 
                    type="text" 
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.03] transition-all font-sans text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Department</label>
                    <select 
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-3 text-white focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.03] transition-all cursor-pointer"
                    >
                      <option value="CSE">CSE (COMPUTERS)</option>
                      <option value="ECE">ECE (ELECTRONICS)</option>
                      <option value="MECH">MECH (MECHANICAL)</option>
                      <option value="CIVIL">CIVIL (ENGINEERING)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Academic Subject</label>
                    <input 
                      type="text" 
                      required
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.03] transition-all"
                    />
                  </div>
                </div>

                {/* Switch components */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] mt-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Catalog approval clearance</span>
                    <p className="text-[8px] text-gray-500">Enable this to permit general student access & downloads.</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setEditApproved(!editApproved)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${
                      editApproved ? "bg-emerald-500" : "bg-gray-800"
                    }`}
                  >
                    <motion.div 
                      layout
                      className="w-4 h-4 rounded-full bg-white shadow-md"
                      animate={{ x: editApproved ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Submitting deck */}
                <div className="flex gap-3.5 pt-4 border-t border-white/[0.04] mt-6">
                  <button 
                    type="button" 
                    onClick={closeEditModal}
                    className="flex-1 py-3 rounded-xl border border-white/5 bg-white/[0.01] text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all text-[10px] font-bold uppercase tracking-widest"
                  >
                    ABORT_SHIFT
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white font-bold tracking-widest hover:brightness-110 shadow-[0_4px_20px_rgba(59,130,246,0.2)] transition-all text-[10px] font-bold uppercase disabled:opacity-40"
                  >
                    {submitting ? "COMMITING..." : "COMMIT_SHIFT"}
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
