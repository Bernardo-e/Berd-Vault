"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown, Zap, Megaphone, Trophy, BookOpen, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NoteCard from "@/components/ui/NoteCard";
import { notesAPI, staffAPI } from "@/lib/api";
import { DEPARTMENTS, YEARS, SEMESTERS, useThemeStore, useAuthStore } from "@/lib/store";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import StudentExamModeShell from "@/components/exam/StudentExamModeShell";

const SORT_OPTIONS = [
  { value: "newest",  label: "Newest First" },
  { value: "oldest",  label: "Oldest First" },
  { value: "popular", label: "Most Downloaded" },
  { value: "rating",  label: "Highest Rated" },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [notes,      setNotes]      = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [firstLoad,  setFirstLoad]  = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { examMode, toggleExamMode } = useThemeStore();
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setFirstLoad(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    staffAPI.getAnnouncements()
      .then((res) => {
        const list = res.data.announcements || [];
        setAnnouncements(list.filter((ann: any) => ["exam", "revision", "important", "instruction", "general", "assignment", "lab"].includes(ann.type)));
      })
      .catch(() => setAnnouncements([]));
  }, []);

  const [filters, setFilters] = useState({
    search:     searchParams.get("search") || "",
    college:    "Sathyabama University",
    department: "",
    year:       "",
    semester:   "",
    subject:    "",
    priority:   searchParams.get("priority") || "",
    sort:       searchParams.get("sort") || "newest",
    page:       1,
  });

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { ...filters, limit: 12 };
      
      // Override for exam mode
      if (examMode) {
          if (user?.department) params.department = user.department;
          params.sort = "popular";
      }

      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await notesAPI.getAll(params);
      
      let fetchedNotes = res.data.notes || [];
      if (examMode) {
          fetchedNotes = fetchedNotes.sort((a: any, b: any) => {
              let scoreA = 0;
              let scoreB = 0;

              // 1. Faculty/staff uploads get +100
              const isFacultyA = a.uploader?.role === 'staff' || a.uploader?.role === 'admin' || a.uploader?.role === 'superadmin';
              const isFacultyB = b.uploader?.role === 'staff' || b.uploader?.role === 'admin' || b.uploader?.role === 'superadmin';
              if (isFacultyA) scoreA += 100;
              if (isFacultyB) scoreB += 100;

              // 2. Staff content tags lift exam-ready and official material
              const priorityScores: Record<string, number> = {
                exam_priority: 90,
                last_minute_prep: 85,
                official: 70,
                important: 50,
                revision_material: 45,
                assignment: 25,
              };
              scoreA += priorityScores[a.priority] || 0;
              scoreB += priorityScores[b.priority] || 0;

              // 3. High ratings weight
              scoreA += (a.avgRating || 0) * 10;
              scoreB += (b.avgRating || 0) * 10;

              // 4. Download weight (popularity)
              scoreA += Math.min((a.downloads || 0) * 0.1, 50);
              scoreB += Math.min((b.downloads || 0) * 0.1, 50);

              return scoreB - scoreA;
          });
      }
      setNotes(fetchedNotes);
      setPagination(res.data.pagination);
    } catch { setNotes([]); }
    finally { setLoading(false); }
  }, [filters, examMode, user]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const update = (k: string, v: string) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const clearFilters = () => setFilters({ search: "", college: "Sathyabama University", department: "", year: "", semester: "", subject: "", priority: "", sort: "newest", page: 1 });

  const hasActiveFilters = filters.college || filters.department || filters.year || filters.semester || filters.subject || filters.search || filters.priority;

  if (firstLoad) return <LoadingScreen />;

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Browse Notes</h1>
              <p className="text-[var(--text-muted)]">
                {examMode ? "High-priority materials curated for your exams" : (pagination ? `${pagination.total.toLocaleString()} notes found` : "Discover notes curated for your courses")}
              </p>
            </div>
            
            {/* Subtle banner toggle for students in header if sidebar is hidden */}
            {user?.role === "student" && (
              <button
                onClick={toggleExamMode}
                className={cn(
                  "self-start md:self-center flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all duration-300 shadow-glow-sm",
                  examMode 
                    ? "bg-[#6C63FF]/20 border-[#6C63FF] text-[#6C63FF]"
                    : "bg-white/5 border-white/5 text-zinc-400 hover:border-[#6C63FF]/30"
                )}
              >
                <Zap size={14} className={examMode ? "fill-[#6C63FF]" : ""} />
                {examMode ? "Deactivate Exam Mode" : "Activate Exam Mode"}
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="glass p-4 rounded-2xl border-purple-500/20 bg-purple-500/5 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
                <Megaphone size={14} />
                Faculty Notice Board
              </div>
              <div className="space-y-3">
                {announcements.length > 0 ? (
                  announcements.slice(0, 3).map((ann, i) => (
                    <div key={ann._id || i} className="text-sm text-zinc-200">
                      <span className="font-bold text-white mr-1.5">• {ann.title}:</span>
                      {ann.content}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-400">No faculty notices posted yet.</div>
                )}
              </div>
            </div>

            {examMode && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#6C63FF]/20 to-[#00D4AA]/10 border border-[#6C63FF]/30 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#6C63FF]/20 text-[#6C63FF] animate-bounce">
                  <Zap size={18} className="fill-[#6C63FF]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Exam Engine Engaged</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Prioritizing Faculty Uploads, Exam-Priority PDFs, and materials matching your department ({user?.department || "General"}).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
            <input
              placeholder="Search by title, subject, or keyword…"
              value={filters.search}
              onChange={e => update("search", e.target.value)}
              className="input-field pl-10 h-11"
            />
          </div>
          <select
            value={filters.sort}
            onChange={e => update("sort", e.target.value)}
            className="input-field h-11 w-44 shrink-0"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-11 px-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center gap-2 text-sm font-medium hover:border-[#6C63FF]/50 transition sm:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <aside className={`shrink-0 w-64 space-y-4 ${sidebarOpen ? "block" : "hidden"} sm:block`}>
            <div className="glass-card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-[#6C63FF] flex items-center gap-1 hover:underline">
                    <X size={12}/> Clear all
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div className="opacity-70">
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">College</label>
                  <input type="text" value="Sathyabama University" disabled className="input-field py-2 text-sm cursor-not-allowed bg-[var(--bg-subtle)]" />
                </div>
                <FilterSelect label="Department" value={filters.department} onChange={(v: string) => update("department", v)} options={DEPARTMENTS} />
                <FilterSelect label="Year" value={filters.year} onChange={(v: string) => update("year", v)} options={YEARS} />
                <FilterSelect label="Semester" value={filters.semester} onChange={(v: string) => update("semester", v)} options={SEMESTERS} />
                <FilterField label="Subject" value={filters.subject} onChange={(v: string) => update("subject", v)} placeholder="e.g. Data Structures" />
                <FilterSelect
                  label="Staff Tag"
                  value={filters.priority}
                  onChange={(v: string) => update("priority", v)}
                  options={["official", "important", "exam_priority", "assignment", "revision_material", "last_minute_prep"]}
                />
                
                {/* Sidebar Exam Mode toggle card */}
                {user?.role === "student" && (
                  <div className="pt-4 border-t border-white/5">
                    <button
                      onClick={toggleExamMode}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                        examMode
                          ? "bg-[#6C63FF]/20 border-[#6C63FF] text-[#6C63FF] shadow-[0_0_15px_rgba(108,99,255,0.3)] font-bold animate-pulse"
                          : "bg-white/5 border-white/5 text-zinc-400 hover:border-[#6C63FF]/30"
                      )}
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <Zap size={14} className={examMode ? "fill-[#6C63FF] text-[#6C63FF]" : "text-zinc-500"} />
                        Exam Mode
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {examMode ? "ACTIVE" : "OFF"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Notes grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="glass-card p-5 h-56">
                    <div className="skeleton h-8 w-8 rounded-xl mb-3" />
                    <div className="skeleton h-4 w-3/4 mb-2" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="font-display text-2xl font-bold mb-2">No notes found</h3>
                <p className="text-[var(--text-muted)] mb-6">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn-brand py-2 px-6 text-sm">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {notes.map((note, i) => <NoteCard key={note._id} note={note} index={i} />)}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setFilters(f => ({ ...f, page: p }))}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                          p === filters.page
                            ? "bg-[#6C63FF] text-white"
                            : "bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[#6C63FF]/50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <StudentExamModeShell />
      <Footer />
    </div>
  );
}

function FilterField({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">{label}</label>
      <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="input-field py-2 text-sm" />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="input-field py-2 text-sm">
        <option value="">All {label}s</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function BrowsePage() {
  return <Suspense><BrowseContent /></Suspense>;
}
