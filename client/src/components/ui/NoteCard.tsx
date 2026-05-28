"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Download, Eye, FileText, Bookmark, BookmarkCheck, ThumbsUp } from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";
import { useAuthStore, useThemeStore } from "@/lib/store";
import { usersAPI, engagementAPI } from "@/lib/api";
import { useState, memo } from "react";
import toast from "react-hot-toast";

interface Note {
  _id: string;
  title: string;
  description: string;
  subject: string;
  department: string;
  college: string;
  year: string;
  semester: string;
  fileType: string;
  avgRating: number;
  ratingCount: number;
  downloads: number;
  views: number;
  createdAt: string;
  uploader?: { name: string; avatar: string };
}

const FILE_COLORS: Record<string, string> = {
  pdf:  "badge-red",
  doc:  "badge-brand",
  docx: "badge-brand",
  ppt:  "badge-teal",
  pptx: "badge-teal",
};

const NoteCard = memo(({ note, index = 0, onBookmarkChange }: { note: any; index?: number; onBookmarkChange?: (note: any, bookmarked: boolean) => void }) => {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [bookmarked, setBookmarked] = useState(
    user?.bookmarks?.includes(note._id) ?? false
  );
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [upvoted, setUpvoted] = useState(
    note.upvotes?.includes(user?._id) ?? false
  );
  const [upvoteCount, setUpvoteCount] = useState(note.upvoteCount ?? 0);
  const [upvoteLoading, setUpvoteLoading] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Login to bookmark notes"); return; }
    setBookmarkLoading(true);
    try {
      const res = await usersAPI.toggleBookmark(note._id);
      setBookmarked(res.data.bookmarked);
      onBookmarkChange?.(note, res.data.bookmarked);
      toast.success(res.data.bookmarked ? "Bookmarked!" : "Removed from bookmarks");
      if (user) {
        const nextBookmarks = res.data.bookmarked
          ? [...(user.bookmarks || []), note._id]
          : (user.bookmarks || []).filter((id: string) => id !== note._id);
        updateUser({ bookmarks: nextBookmarks });
      }
    } catch { toast.error("Failed to bookmark"); }
    finally { setBookmarkLoading(false); }
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Login to upvote notes"); return; }
    setUpvoteLoading(true);
    const wasUpvoted = upvoted;
    const prevCount = upvoteCount;
    // Optimistic UI updates
    setUpvoted(!wasUpvoted);
    setUpvoteCount((prev: number) => (wasUpvoted ? Math.max(0, prev - 1) : prev + 1));

    try {
      const res = await engagementAPI.upvote(note._id);
      setUpvoted(res.data.isUpvoted);
      setUpvoteCount(res.data.upvoteCount);
      toast.success(res.data.isUpvoted ? "Upvoted!" : "Removed upvote");
    } catch {
      // Rollback
      setUpvoted(wasUpvoted);
      setUpvoteCount(prevCount);
      toast.error("Failed to upvote");
    } finally {
      setUpvoteLoading(false);
    }
  };

  const { examMode } = useThemeStore();
  const priorityLabels: Record<string, string> = {
    official: "Official",
    important: "Important",
    exam_priority: "Exam Priority",
    assignment: "Assignment",
    revision_material: "Revision",
    last_minute_prep: "Last Minute Prep",
  };
  const priorityStyles: Record<string, string> = {
    official: "badge-teal",
    important: "badge-red",
    exam_priority: "badge-red",
    assignment: "badge-brand",
    revision_material: "badge-teal",
    last_minute_prep: "badge-red",
  };
  const isImportant = examMode && (note.isExamMode || ["exam_priority", "official", "important", "revision_material", "last_minute_prep"].includes(note.priority) || (note.avgRating >= 4.5) || (note.downloads > 50));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(examMode ? "focus-highlight" : "")}
    >
      <Link href={`/notes/${note._id}`}>
        <div className={cn(
          "glass-card h-full p-5 flex flex-col gap-3 cursor-pointer group transition-all duration-300",
          isImportant ? "important-item" : "",
          examMode && !isImportant ? "opacity-80 grayscale-[0.3]" : ""
        )}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            {/* File type icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4AA]/20 flex items-center justify-center shrink-0">
              <FileText size={20} className="text-[#6C63FF]" />
            </div>

            <div className="flex items-center gap-1.5 ml-auto relative z-10">
              <span className={cn("badge", FILE_COLORS[note.fileType] || "badge-brand")}>
                {note.fileType?.toUpperCase()}
              </span>
              {priorityLabels[note.priority] && (
                <span className={cn("badge hidden sm:inline-flex", priorityStyles[note.priority])}>
                  {priorityLabels[note.priority]}
                </span>
              )}
              
              {/* Upvote Button */}
              <button
                onClick={handleUpvote}
                disabled={upvoteLoading}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all duration-300",
                  upvoted ? "text-pink-500 bg-pink-500/10 shadow-[0_0_10px_rgba(236,72,153,0.2)]" : "text-zinc-500 hover:text-pink-400"
                )}
                aria-label="Upvote"
              >
                <ThumbsUp size={14} className={cn(upvoted ? "fill-pink-500 text-pink-500" : "")} />
              </button>

              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all duration-300",
                  bookmarked ? "text-purple-500 bg-purple-500/10 shadow-[0_0_10px_rgba(108,99,255,0.2)]" : "text-zinc-500 hover:text-purple-400"
                )}
                aria-label="Bookmark"
              >
                {bookmarked
                  ? <BookmarkCheck size={14} className="text-[#6C63FF]" />
                  : <Bookmark size={14} />
                }
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="font-display font-semibold text-base leading-snug line-clamp-2 group-hover:text-[#6C63FF] transition-colors">
              {note.title}
            </h3>
            {note.description && (
              <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                {note.description}
              </p>
            )}
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className="badge badge-brand text-xs">{note.subject}</span>
            <span className="text-xs text-[var(--text-faint)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-full border border-[var(--border)]">
              {note.year}
            </span>
            <span className="text-xs text-[var(--text-faint)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-full border border-[var(--border)]">
              {note.semester}
            </span>
            {priorityLabels[note.priority] && (
              <span className={cn("badge sm:hidden text-xs", priorityStyles[note.priority])}>
                {priorityLabels[note.priority]}
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-auto pt-3 border-t border-[var(--border)]">
            <div className="flex flex-wrap items-center gap-3">
              {/* Stars */}
              <span className="flex items-center gap-1" title="Rating">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span className="font-medium">{note.avgRating?.toFixed(1) || "0.0"}</span>
                <span className="text-[var(--text-faint)]">({note.ratingCount || 0})</span>
              </span>
              {/* Upvotes */}
              <span className="flex items-center gap-1" title="Upvotes">
                <ThumbsUp size={12} className={cn(upvoted ? "text-pink-500 fill-pink-500/20" : "")} />
                <span>{upvoteCount}</span>
              </span>
              {/* Downloads */}
              <span className="flex items-center gap-1" title="Downloads">
                <Download size={12} />
                {note.downloads || 0}
              </span>
              {/* Views */}
              <span className="flex items-center gap-1" title="Views">
                <Eye size={12} />
                {note.views || 0}
              </span>
            </div>
            <span className="text-[var(--text-faint)] shrink-0">{timeAgo(note.createdAt)}</span>
          </div>

          {/* Uploader */}
          {note.uploader && (
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
              <img
                src={note.uploader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(note.uploader.name)}&background=6C63FF&color=fff&bold=true&size=32`}
                alt={note.uploader.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="text-xs text-[var(--text-muted)]">{note.uploader.name}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

export default NoteCard;
