"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle, ChevronDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { notesAPI } from "@/lib/api";
import { useAuthStore, DEPARTMENTS, YEARS, SEMESTERS } from "@/lib/store";
import { formatBytes } from "@/lib/utils";
import toast from "react-hot-toast";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const ACCEPTED = { "application/pdf": [".pdf"], "application/msword": [".doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "application/vnd.ms-powerpoint": [".ppt"], "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"] };

export default function UploadPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        setTimeout(checkHydration, 50);
      }
    };
    checkHydration();
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      toast.error("Please login first");
      router.push("/auth");
    }
  }, [isHydrated, isAuthenticated]);

  const [file, setFile]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success,  setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", subject: "",
    department: "", college: "Sathyabama University", year: "", semester: "", tags: "",
    isExamMode: false
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, maxSize: 20 * 1024 * 1024, multiple: false
  });

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please login first"); router.push("/auth"); return; }
    if (!file)            { toast.error("Please select a file"); return; }
    if (!form.title || !form.subject || !form.department || !form.college || !form.year || !form.semester) {
      toast.error("Please fill in all required fields"); return;
    }

    const fd = new FormData();
    fd.append("file", file);
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));

    setLoading(true);
    // Simulate progress
    const interval = setInterval(() => setProgress(p => Math.min(p + 10, 90)), 300);

    try {
      const res = await notesAPI.upload(fd);
      clearInterval(interval);
      setProgress(100);
      setSuccess(true);
      toast.success("Note uploaded successfully! 🎉");
      setTimeout(() => router.push(`/notes/${res.data.note._id}`), 1500);
    } catch (err: any) {
      clearInterval(interval);
      setProgress(0);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="mesh-bg min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#00D4AA]/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-[#00D4AA]" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Uploaded!</h2>
          <p className="text-[var(--text-muted)]">Redirecting to your note…</p>
        </motion.div>
      </div>
    );
  }

  if (initialLoading || !isHydrated) return <LoadingScreen />;

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">Upload Notes</h1>
          <p className="text-[var(--text-muted)] mb-8">Share your knowledge with thousands of students</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`glass-card p-10 text-center cursor-pointer transition-all border-2 border-dashed ${
                isDragActive
                  ? "border-[#6C63FF] bg-[#6C63FF]/10 scale-[1.01]"
                  : file
                  ? "border-[#00D4AA]/60 bg-[#00D4AA]/5"
                  : "border-[var(--border)] hover:border-[#6C63FF]/50"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#00D4AA]/20 flex items-center justify-center">
                    <FileText size={28} className="text-[#00D4AA]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text)]">{file.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null); }}
                    className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                  >
                    <X size={12}/> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#6C63FF]/15 flex items-center justify-center animate-float">
                    <Upload size={28} className="text-[#6C63FF]" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {isDragActive ? "Drop it here!" : "Drag & drop your file here"}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      or <span className="text-[#6C63FF] font-medium">click to browse</span>
                    </p>
                  </div>
                  <p className="text-xs text-[var(--text-faint)]">PDF, DOC, DOCX, PPT, PPTX · Max 20MB</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Form fields */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-display font-semibold text-lg">Note Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label-field">Title *</label>
                  <input className="input-field" placeholder="e.g. Data Structures Complete Notes" value={form.title} onChange={e => update("title", e.target.value)} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-field">Description</label>
                  <textarea className="input-field resize-none" rows={3} placeholder="Brief description of what's covered…" value={form.description} onChange={e => update("description", e.target.value)} />
                </div>
                <div>
                  <label className="label-field">Subject *</label>
                  <input className="input-field" placeholder="e.g. Data Structures & Algorithms" value={form.subject} onChange={e => update("subject", e.target.value)} required />
                </div>
                <div className="opacity-70">
                  <label className="label-field">College *</label>
                  <input className="input-field cursor-not-allowed bg-[var(--bg-subtle)]" value="Sathyabama University" disabled />
                </div>
                <div>
                  <label className="label-field">Department *</label>
                  <select className="input-field" value={form.department} onChange={e => update("department", e.target.value)} required>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Year *</label>
                  <select className="input-field" value={form.year} onChange={e => update("year", e.target.value)} required>
                    <option value="">Select year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Semester *</label>
                  <select className="input-field" value={form.semester} onChange={e => update("semester", e.target.value)} required>
                    <option value="">Select semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Tags (comma separated)</label>
                  <input className="input-field" placeholder="e.g. arrays, sorting, algorithms" value={form.tags} onChange={e => update("tags", e.target.value)} />
                </div>
                
                {user?.role === "staff" && (
                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 group cursor-pointer" onClick={() => update("isExamMode", !form.isExamMode)}>
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.isExamMode ? "bg-purple-500 border-purple-500" : "border-purple-500/30 bg-white/5 group-hover:border-purple-500/50"}`}>
                        {form.isExamMode && <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-purple-400 uppercase tracking-widest">Exam Mode?</p>
                        <p className="text-xs text-purple-300/60">Mark this as an important question paper or mandatory study material.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading || !file} className="btn-brand w-full justify-center py-3.5 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Uploading…
                </span>
              ) : (
                <span className="flex items-center gap-2"><Upload size={18}/> Upload Note</span>
              )}
            </button>
          </form>
        </motion.div>
      </main>
      <Footer />

      <style jsx>{`
        .label-field { display: block; font-size: 0.8rem; font-weight: 500; color: var(--text-muted); margin-bottom: 0.375rem; }
      `}</style>
    </div>
  );
}
