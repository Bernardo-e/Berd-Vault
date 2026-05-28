"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Trash2, 
  ExternalLink,
  FileText,
  Check,
  Layers,
  Star,
  EyeOff,
  ShieldCheck
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface ContentTabProps {
  notes: any[];
  setNotes: React.Dispatch<React.SetStateAction<any[]>>;
  onRefresh: () => void;
}

export default function EliteContentMatrix({ notes, setNotes, onRefresh }: ContentTabProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const filtered = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.subject.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(n => n._id));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Confirm permanent deletion of ${selectedIds.length} uploaded files?`)) return;
    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => adminAPI.deleteNote(id)));
      toast.success("Content purged successfully");
      setSelectedIds([]);
      onRefresh();
    } catch { 
      toast.error("Operation failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleBulkTag = async (priority: string) => {
    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => adminAPI.moderateNote(id, { priority })));
      toast.success("Content tags updated");
      setSelectedIds([]);
      onRefresh();
    } catch { 
      toast.error("Operation failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Search & Bulk HUD ── */}
      <div className="flex flex-col xl:flex-row gap-6 items-center">
        
        {/* Search Input */}
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search documents by title, course, or subject area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#07070c]/50 border border-white/[0.04] rounded-2xl py-4 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-white/[0.12] transition-all font-sans"
          />
        </div>

        {/* Bulk Action Buttons Toolbar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="flex items-center gap-4 p-3 bg-[#07070c]/80 border border-white/[0.08] rounded-2xl backdrop-blur-2xl shadow-2xl flex-wrap w-full xl:w-auto"
            >
              <div className="px-4 py-2 text-[10px] font-mono font-bold text-indigo-400 border-r border-white/[0.04] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                {selectedIds.length} ITEMS SELECTED
              </div>
              <div className="flex flex-wrap gap-1.5 p-1">
                {['official', 'important', 'exam_priority', 'trending'].map((p) => (
                  <button 
                    key={p}
                    onClick={() => handleBulkTag(p)}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent transition-all duration-200"
                  >
                    {p.replace("_", " ")}
                  </button>
                ))}
                <button 
                  onClick={handleBulkDelete}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-mono font-bold uppercase tracking-wider shadow-lg transition-all duration-200 flex items-center gap-1.5"
                >
                  <Trash2 size={12} /> Purge Selected
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SaaS Table ── */}
      <div className="rounded-2xl border border-white/[0.04] bg-[#07070c]/30 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#0b0b12] border-b border-white/[0.04] font-mono text-[9px] text-gray-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 w-12">
                  <button 
                    onClick={selectAll}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      selectedIds.length === filtered.length && filtered.length > 0
                        ? "bg-indigo-600 border-indigo-500 text-white" 
                        : "bg-black/60 border-white/10 text-transparent"
                    }`}
                  >
                    <Check size={11} strokeWidth={4} />
                  </button>
                </th>
                <th className="px-6 py-4 font-black">Document Name</th>
                <th className="px-6 py-4 font-black">Clearance / Tag</th>
                <th className="px-6 py-4 font-black text-center">Downloads</th>
                <th className="px-6 py-4 font-black text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map((note) => (
                <motion.tr 
                  key={note._id}
                  layout
                  className={`hover:bg-white/[0.01] transition-all duration-200 group ${selectedIds.includes(note._id) ? "bg-white/[0.02]" : ""}`}
                >
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleSelect(note._id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        selectedIds.includes(note._id)
                          ? "bg-indigo-600 border-indigo-500 text-white" 
                          : "bg-black/60 border-white/10 text-transparent"
                      }`}
                    >
                      <Check size={11} strokeWidth={4} />
                    </button>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-black border border-white/5 flex items-center justify-center text-indigo-400 shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate max-w-[280px] font-sans">{note.title}</p>
                        <p className="text-[9.5px] text-gray-500 font-mono truncate mt-0.5">
                          COURSE: {note.subject?.toUpperCase()} • UPLOADED BY: {note.uploader?.name || "SYSTEM"}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold border tracking-wide uppercase ${
                        note.priority !== 'none' 
                          ? "text-amber-400 border-amber-500/10 bg-amber-500/5" 
                          : "text-gray-500 border-white/5 bg-white/5"
                      }`}>
                        {(note.priority || "none").replace("_", " ")}
                      </span>
                      {note.isFeatured && (
                        <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold border text-indigo-400 border-indigo-500/10 bg-indigo-500/5 tracking-wide">
                          FEATURED
                        </span>
                      )}
                      {!note.isApproved && (
                        <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold border text-rose-400 border-rose-500/10 bg-rose-500/5 tracking-wide">
                          HIDDEN
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono font-bold text-white">{note.downloads}</span>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => adminAPI.moderateNote(note._id, { isFeatured: !note.isFeatured }).then(onRefresh)}
                        className="p-2 hover:bg-white/[0.04] rounded-lg text-gray-400 hover:text-white transition-all"
                        title="Toggle featured"
                      >
                        <Star size={14} className={note.isFeatured ? "fill-indigo-400 text-indigo-400" : ""} />
                      </button>
                      <button
                        onClick={() => adminAPI.moderateNote(note._id, { isApproved: !note.isApproved }).then(onRefresh)}
                        className="p-2 hover:bg-white/[0.04] rounded-lg text-gray-400 hover:text-white transition-all"
                        title="Toggle visibility"
                      >
                        {note.isApproved ? <EyeOff size={14} /> : <ShieldCheck size={14} />}
                      </button>
                      <button 
                        onClick={() => { if(confirm("Permanently delete this document from platform databases?")) adminAPI.deleteNote(note._id).then(onRefresh); }}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-gray-400 hover:text-rose-400 transition-all"
                        title="Purge document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3 opacity-60">
            <Layers size={32} className="text-gray-700" />
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">No matching records found in this sector</p>
          </div>
        )}
      </div>

    </div>
  );
}
