"use client";

import { useMemo, useState } from "react";
import { Download, Edit3, Eye, FileText, Heart, Plus, Search, Tag, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { staffAPI } from "@/lib/api";
import { DEPARTMENTS, SEMESTERS, YEARS } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";

interface UploadManagerProps {
  notes: any[];
  onRefresh: () => void;
}

const EMPTY_FORM = {
  title: "",
  subject: "",
  department: "",
  year: "",
  semester: "",
  tags: "",
  description: "",
  priority: "official",
};

const PRIORITY_OPTIONS = [
  { value: "official", label: "Official" },
  { value: "important", label: "Important" },
  { value: "exam_priority", label: "Exam Priority" },
  { value: "assignment", label: "Assignment" },
  { value: "revision_material", label: "Revision Material" },
  { value: "last_minute_prep", label: "Last Minute Prep" },
  { value: "none", label: "Standard" },
];

const PRIORITY_STYLES: Record<string, string> = {
  official: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  important: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  exam_priority: "bg-red-500/10 text-red-400 border-red-500/25",
  assignment: "bg-violet-500/10 text-violet-400 border-violet-500/25",
  revision_material: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  last_minute_prep: "bg-pink-500/10 text-pink-400 border-pink-500/25",
  none: "bg-white/5 text-[var(--text-muted)] border-white/10",
};

export default function UploadManager({ notes, onRefresh }: UploadManagerProps) {
  const [query, setQuery] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredNotes = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return notes;
    return notes.filter((note) =>
      [note.title, note.subject, note.department, note.priority, ...(note.tags || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [notes, query]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setEditingId(null);
    setModalMode("create");
  };

  const openEdit = (note: any) => {
    setForm({
      title: note.title || "",
      subject: note.subject || "",
      department: note.department || "",
      year: note.year || "",
      semester: note.semester || "",
      tags: (note.tags || []).join(", "),
      description: note.description || "",
      priority: note.priority || "none",
    });
    setFile(null);
    setEditingId(note._id);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "create" && !file) {
      toast.error("Please select a PDF file");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "create") {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
        formData.append("college", "Sathyabama University");
        if (file) formData.append("file", file);
        await staffAPI.uploadNote(formData);
        toast.success("Material uploaded");
      } else if (editingId) {
        await staffAPI.updateNote(editingId, form);
        toast.success("Material updated");
      }
      closeModal();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Unable to save material");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this upload permanently?")) return;
    try {
      await staffAPI.deleteNote(id);
      toast.success("Material deleted");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-black text-white">Content Management</h2>
          <p className="text-sm text-[var(--text-muted)]">Upload PDFs, assignments, important questions, revision packs, and exam prep material.</p>
        </div>
        <button onClick={openCreate} className="btn-brand py-3 px-5 text-sm">
          <Plus size={18} />
          Upload Material
        </button>
      </div>

      <div className="glass-card p-4 border-white/10 bg-black/20">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search uploads by title, subject, tag..."
            className="input-field !pl-10 h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredNotes.map((note) => (
          <article key={note._id} className="glass-card p-5 border-white/10 bg-black/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <FileText size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-white truncate">{note.title}</h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {note.subject} / {note.department} / {note.year} / {note.semester}
                  </p>
                </div>
              </div>
              <span className={cn("shrink-0 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider", PRIORITY_STYLES[note.priority || "none"])}>
                {(note.priority || "standard").replace("_", " ")}
              </span>
            </div>

            {note.description && <p className="mt-4 text-sm text-[var(--text-muted)] line-clamp-2">{note.description}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {(note.tags || []).slice(0, 5).map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
                  <Tag size={11} />
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1"><Download size={13} />{note.downloads || 0}</span>
                <span className="inline-flex items-center gap-1"><Heart size={13} />{note.upvoteCount || 0}</span>
                <span className="inline-flex items-center gap-1"><Eye size={13} />{note.views || 0}</span>
                <span>{timeAgo(note.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(note)} className="rounded-lg border border-white/10 p-2 text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition" aria-label="Edit material">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDelete(note._id)} className="rounded-lg border border-white/10 p-2 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition" aria-label="Delete material">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="glass-card p-12 text-center border-white/10 bg-black/20">
          <Upload size={42} className="mx-auto text-[var(--text-faint)] mb-3" />
          <p className="font-semibold text-white">No materials found</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Upload your first official PDF to begin.</p>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="glass-card w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 border-white/10 bg-[#0b0b18]">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="font-display text-xl font-black text-white">{modalMode === "create" ? "Upload Staff Material" : "Edit Staff Material"}</h3>
                <p className="text-sm text-[var(--text-muted)]">Keep metadata clear so students can find it quickly.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-xl p-2 hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
              <Field label="Subject" value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} required />
              <SelectField label="Department" value={form.department} onChange={(value) => setForm({ ...form, department: value })} options={DEPARTMENTS} required />
              <SelectField label="Year" value={form.year} onChange={(value) => setForm({ ...form, year: value })} options={YEARS} required />
              <SelectField label="Semester" value={form.semester} onChange={(value) => setForm({ ...form, semester: value })} options={SEMESTERS} required />
              <SelectField label="Content Tag" value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} options={PRIORITY_OPTIONS.map((item) => item.value)} labels={Object.fromEntries(PRIORITY_OPTIONS.map((item) => [item.value, item.label]))} required />
            </div>

            <div className="mt-4 space-y-4">
              <Field label="Tags" value={form.tags} onChange={(value) => setForm({ ...form, tags: value })} placeholder="networks, unit 1, model questions" />
              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Short context for students..."
                />
              </label>

              {modalMode === "create" && (
                <label className="block rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] p-8 text-center hover:border-[#6C63FF]/50 transition cursor-pointer">
                  <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <Upload size={32} className="mx-auto text-[#6C63FF] mb-2" />
                  <p className="text-sm font-semibold text-white">{file ? file.name : "Select PDF file"}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">PDF only</p>
                </label>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="btn-outline py-3 px-5 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-brand py-3 px-5 text-sm disabled:opacity-60">
                {saving ? "Saving..." : modalMode === "create" ? "Upload Material" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="input-field" />
    </label>
  );
}

function SelectField({ label, value, onChange, options, labels, required = false }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string>; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className="input-field">
        <option value="" className="bg-[#111827]">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#111827]">
            {labels?.[option] || option}
          </option>
        ))}
      </select>
    </label>
  );
}
