"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Download, Star, Eye, MessageCircle, Calendar,
  Building2, BookOpen, Bookmark, BookmarkCheck,
  FileText, User, ArrowLeft, Send, Trash2
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { notesAPI, usersAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { timeAgo, formatBytes, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [note,        setNote]        = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [bookmarked,  setBookmarked]  = useState(false);
  const [comment,     setComment]     = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [userRating,  setUserRating]  = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (!id) return;
    notesAPI.getOne(id as string)
      .then(res => {
        setNote(res.data.note);
        // Check if user already rated
        if (user && res.data.note.ratings) {
          const existing = res.data.note.ratings.find((r: any) => r.user === user._id || r.user?._id === user._id);
          if (existing) setUserRating(existing.score);
        }
        if (user?.bookmarks?.includes(id as string)) setBookmarked(true);
      })
      .catch(() => toast.error("Note not found"))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleDownload = async () => {
    if (!isAuthenticated) { toast.error("Login to download"); return; }
    setDownloading(true);
    try {
      const res = await notesAPI.download(id as string);
      window.open(res.data.fileUrl, "_blank");
      setNote((n: any) => n ? { ...n, downloads: n.downloads + 1 } : n);
      toast.success("Download started!");
    } catch { toast.error("Download failed"); }
    finally { setDownloading(false); }
  };

  const handleRate = async (score: number) => {
    if (!isAuthenticated) { toast.error("Login to rate"); return; }
    try {
      const res = await notesAPI.rate(id as string, score);
      setUserRating(score);
      setNote((n: any) => n ? { ...n, avgRating: res.data.avgRating, ratingCount: res.data.ratingCount } : n);
      toast.success("Rating saved!");
    } catch { toast.error("Failed to rate"); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Login to comment"); return; }
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await notesAPI.comment(id as string, comment);
      setNote((n: any) => n ? { ...n, comments: [...(n.comments || []), res.data.comment] } : n);
      setComment("");
      toast.success("Comment added!");
    } catch { toast.error("Failed to add comment"); }
    finally { setSubmitting(false); }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error("Login to bookmark"); return; }
    try {
      const res = await usersAPI.toggleBookmark(id as string);
      setBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? "Bookmarked!" : "Removed from bookmarks");
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await notesAPI.delete(id as string);
      toast.success("Note deleted");
      router.push("/dashboard");
    } catch { toast.error("Failed to delete"); }
  };

  if (loading) {
    return (
      <div className="mesh-bg min-h-screen">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
          <div className="space-y-5">
            <div className="skeleton h-8 w-2/3 rounded-xl" />
            <div className="skeleton h-4 w-1/2 rounded-xl" />
            <div className="skeleton h-64 w-full rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="mesh-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">📄</p>
          <h2 className="font-display text-2xl font-bold mb-2">Note not found</h2>
          <Link href="/browse" className="btn-brand py-2 px-6 text-sm mt-4 inline-flex">Back to Browse</Link>
        </div>
      </div>
    );
  }

  const isOwner = user?._id === (note.uploader?._id || note.uploader);

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-6 transition">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Note header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-7">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4AA]/20 flex items-center justify-center shrink-0">
                  <FileText size={28} className="text-[#6C63FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="font-display text-2xl font-bold leading-tight">{note.title}</h1>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={handleBookmark} className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center hover:border-[#6C63FF]/50 transition">
                        {bookmarked
                          ? <BookmarkCheck size={17} className="text-[#6C63FF]" />
                          : <Bookmark size={17} className="text-[var(--text-muted)]" />
                        }
                      </button>
                      {(isOwner || user?.role === "admin") && (
                        <button onClick={handleDelete} className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition">
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  {note.description && (
                    <p className="text-[var(--text-muted)] text-sm mt-2 leading-relaxed">{note.description}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {note.tags.map((tag: string) => (
                    <span key={tag} className="badge badge-brand text-xs">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Meta info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-[var(--border)]">
                {[
                  { icon: <Building2 size={14}/>, label: note.college },
                  { icon: <BookOpen size={14}/>,  label: note.department },
                  { icon: <User size={14}/>,      label: note.year },
                  { icon: <Calendar size={14}/>,  label: note.semester },
                  { icon: <Eye size={14}/>,       label: `${note.views} views` },
                  { icon: <Calendar size={14}/>,  label: timeAgo(note.createdAt) },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <span className="text-[#6C63FF] shrink-0">{m.icon}</span>
                    <span className="truncate">{m.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Rating */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <Star size={18} className="text-amber-400" /> Rate This Note
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      className="star text-2xl transition-transform"
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => handleRate(s)}
                    >
                      <Star
                        size={28}
                        className={cn(
                          "transition-colors",
                          s <= (hoveredStar || userRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-[var(--text-faint)]"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  <span className="font-bold text-lg text-[var(--text)]">{note.avgRating?.toFixed(1) || "0.0"}</span>
                  {" "}({note.ratingCount || 0} ratings)
                </div>
              </div>
              {userRating > 0 && (
                <p className="text-sm text-[#00D4AA] mt-2">✓ You rated this {userRating} star{userRating > 1 ? "s" : ""}</p>
              )}
            </motion.div>

            {/* Comments */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
              <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
                <MessageCircle size={18} className="text-[#6C63FF]" /> Comments ({note.comments?.length || 0})
              </h3>

              {/* Add comment */}
              <form onSubmit={handleComment} className="flex gap-3 mb-6">
                {user && (
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6C63FF&color=fff&bold=true&size=64`}
                    alt={user.name}
                    className="w-9 h-9 rounded-full shrink-0 mt-0.5"
                  />
                )}
                <div className="flex-1 flex gap-2">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={isAuthenticated ? "Add a comment…" : "Login to comment"}
                    disabled={!isAuthenticated}
                    className="input-field flex-1 py-2.5"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim() || !isAuthenticated}
                    className="btn-brand py-2.5 px-4"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </form>

              {/* Comment list */}
              {note.comments?.length === 0 ? (
                <p className="text-sm text-[var(--text-faint)] text-center py-6">No comments yet — be the first!</p>
              ) : (
                <div className="space-y-4">
                  {note.comments.map((c: any, i: number) => (
                    <motion.div
                      key={c._id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3"
                    >
                      <img
                        src={c.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.name || "U")}&background=6C63FF&color=fff&bold=true&size=64`}
                        alt={c.user?.name}
                        className="w-8 h-8 rounded-full shrink-0 mt-0.5"
                      />
                      <div className="flex-1 bg-[var(--bg-subtle)] rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{c.user?.name || "Anonymous"}</span>
                          <span className="text-xs text-[var(--text-faint)]">{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">{c.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Download card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4AA]/20 flex items-center justify-center mx-auto mb-4">
                <Download size={28} className="text-[#6C63FF]" />
              </div>
              <p className="font-display font-bold text-2xl">{note.downloads}</p>
              <p className="text-sm text-[var(--text-muted)] mb-5">downloads</p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-brand w-full justify-center py-3"
              >
                {downloading ? "Opening…" : <><Download size={16}/> Download Now</>}
              </button>
              <p className="text-xs text-[var(--text-faint)] mt-3">
                {note.fileType?.toUpperCase()} · {note.fileSize ? formatBytes(note.fileSize) : "—"}
              </p>
            </motion.div>

            {/* Uploader card */}
            {note.uploader && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
                <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-4 uppercase tracking-wide">Uploaded by</h4>
                <Link href={`/profile/${note.uploader._id}`} className="flex items-center gap-3 group">
                  <img
                    src={note.uploader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(note.uploader.name)}&background=6C63FF&color=fff&bold=true&size=80`}
                    alt={note.uploader.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm group-hover:text-[#6C63FF] transition">{note.uploader.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {note.uploader.college || note.uploader.department || "Student"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Note meta */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 space-y-3">
              <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide">Details</h4>
              {[
                { label: "Subject",    value: note.subject },
                { label: "Department", value: note.department },
                { label: "Year",       value: note.year },
                { label: "Semester",   value: note.semester },
                { label: "Format",     value: note.fileType?.toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{label}</span>
                  <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
