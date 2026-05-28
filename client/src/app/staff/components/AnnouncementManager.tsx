"use client";

import { useState } from "react";
import { AlertCircle, CalendarClock, Edit3, Heart, Megaphone, Pin, Plus, Send, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { staffAPI } from "@/lib/api";
import { cn, timeAgo } from "@/lib/utils";

interface AnnouncementsProps {
  announcements: any[];
  onRefresh: () => void;
}

const TYPE_OPTIONS = [
  { value: "general", label: "Important Notice" },
  { value: "exam", label: "Exam Update" },
  { value: "assignment", label: "Assignment Deadline" },
  { value: "lab", label: "Lab Update" },
  { value: "important", label: "Important Notice" },
  { value: "revision", label: "Revision Schedule" },
  { value: "instruction", label: "Instruction" },
];

const TYPE_STYLES: Record<string, string> = {
  general: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  exam: "bg-red-500/10 text-red-400 border-red-500/25",
  assignment: "bg-violet-500/10 text-violet-400 border-violet-500/25",
  lab: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  important: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  revision: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  instruction: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
};

export default function AnnouncementManager({ announcements, onRefresh }: AnnouncementsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", type: "general", isPinned: false });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", content: "", type: "general", isPinned: false });
    setShowModal(true);
  };

  const openEdit = (ann: any) => {
    setEditingId(ann._id);
    setForm({ title: ann.title || "", content: ann.content || "", type: ann.type || "general", isPinned: Boolean(ann.isPinned) });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await staffAPI.updateAnnouncement(editingId, form);
        toast.success("Announcement updated");
      } else {
        await staffAPI.postAnnouncement(form);
        toast.success("Announcement published");
      }
      setForm({ title: "", content: "", type: "general", isPinned: false });
      setEditingId(null);
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Unable to publish announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await staffAPI.deleteAnnouncement(id);
      toast.success("Announcement deleted");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Unable to delete announcement");
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-black text-white">Announcements</h2>
          <p className="text-sm text-[var(--text-muted)]">Post exam updates, deadlines, notices, and revision schedules.</p>
        </div>
        <button onClick={openCreate} className="btn-brand py-3 px-5 text-sm">
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {announcements.map((ann) => (
          <article key={ann._id} className="glass-card p-5 border-white/10 bg-black/20 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider", TYPE_STYLES[ann.type] || TYPE_STYLES.general)}>
                  {TYPE_OPTIONS.find((item) => item.value === ann.type)?.label || ann.type}
                </span>
                {ann.isPinned && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#8a84ff]">
                    <Pin size={11} /> Pinned
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(ann)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/5 hover:text-white transition" aria-label="Edit announcement">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => handleDelete(ann._id)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition" aria-label="Delete announcement">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <h3 className="mt-4 font-display text-lg font-bold text-white leading-tight">{ann.title}</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed line-clamp-4">{ann.content}</p>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1"><CalendarClock size={13} />{timeAgo(ann.createdAt)}</span>
              <span className="inline-flex items-center gap-1"><Heart size={13} />{ann.appreciationCount || 0}</span>
            </div>
          </article>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="glass-card p-12 text-center border-white/10 bg-black/20">
          <Megaphone size={42} className="mx-auto text-[var(--text-faint)] mb-3" />
          <p className="font-semibold text-white">No announcements yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Publish a clear update for your students.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="glass-card w-full max-w-2xl p-6 border-white/10 bg-[#0b0b18]">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="font-display text-xl font-black text-white">{editingId ? "Edit Announcement" : "Publish Announcement"}</h3>
                <p className="text-sm text-[var(--text-muted)]">Categorize and pin important notices for student feeds.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl p-2 hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Midterm revision session schedule"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span>
                  <span className="block text-sm font-semibold text-white">Pin announcement</span>
                  <span className="block text-xs text-[var(--text-muted)] mt-0.5">Pinned notices stay above the feed.</span>
                </span>
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                  className="h-5 w-5 accent-[#6C63FF]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Announcement Type</span>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                  {TYPE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value} className="bg-[#111827]">{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  <AlertCircle size={13} />
                  Message
                </span>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  required
                  className="input-field resize-none"
                  placeholder="Share the details students need..."
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="btn-outline py-3 px-5 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-brand py-3 px-5 text-sm disabled:opacity-60">
                <Send size={16} />
                {saving ? "Saving..." : editingId ? "Save Changes" : "Publish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
