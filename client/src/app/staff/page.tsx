"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Award, BarChart3, BookOpen, Calendar, ClipboardList, Download, Eye, Heart, MessageCircle, Pin, RefreshCw, Settings, ShieldCheck, Target, TrendingUp, UploadCloud, User } from "lucide-react";
import toast from "react-hot-toast";
import { staffAPI } from "@/lib/api";
import { DEPARTMENTS, useAuthStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";
import StaffSidebar from "./components/StaffSidebar";
import StatsCards from "./components/StatsCards";
import UploadManager from "./components/UploadManager";
import AnnouncementManager from "./components/AnnouncementManager";

type Tab = "overview" | "uploads" | "announcements" | "engagement" | "analytics" | "profile";

export default function StaffPortal() {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const waitForHydration = () => {
      if (useAuthStore.persist.hasHydrated()) setIsHydrated(true);
      else setTimeout(waitForHydration, 50);
    };
    waitForHydration();
  }, []);

  const syncData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, notesRes, announcementsRes, profileRes] = await Promise.all([
        staffAPI.getStats(),
        staffAPI.getNotes(),
        staffAPI.getMyAnnouncements(),
        staffAPI.getProfile(),
      ]);
      setStats(statsRes.data.stats || {});
      setNotes(notesRes.data.notes || []);
      setAnnouncements(announcementsRes.data.announcements || []);
      setProfile(profileRes.data.user || user);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load staff portal");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push("/auth");
      return;
    }
    if (user.role !== "staff") {
      router.push("/dashboard");
      return;
    }
    syncData();
  }, [isHydrated, isAuthenticated, user, router, syncData]);

  const analytics = useMemo(() => {
    const totalDownloads = notes.reduce((sum, note) => sum + (note.downloads || 0), 0);
    const totalViews = notes.reduce((sum, note) => sum + (note.views || 0), 0);
    const totalUpvotes = notes.reduce((sum, note) => sum + (note.upvoteCount || 0), 0);
    const topSubjects = Object.entries(
      notes.reduce((acc: Record<string, number>, note) => {
        if (note.subject) acc[note.subject] = (acc[note.subject] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalDownloads, totalViews, totalUpvotes, topSubjects };
  }, [notes]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isHydrated || loading) {
    return (
      <div className="mesh-bg min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 border-white/10 bg-black/20 text-center">
          <RefreshCw size={28} className="mx-auto mb-3 animate-spin text-[#6C63FF]" />
          <p className="font-semibold text-white">Loading Staff Portal</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Preparing your materials and analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen text-white">
      <StaffSidebar activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as Tab)} onLogout={handleLogout} />

      <main className="lg:ml-72 min-h-screen">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080812]/85 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6 lg:px-8 py-5">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#6C63FF]">
                <Calendar size={13} />
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </div>
              <h1 className="mt-1 font-display text-2xl font-black tracking-tight">Faculty Staff Portal</h1>
              <p className="text-sm text-[var(--text-muted)]">Manage official material, announcements, and student engagement.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => syncData(true)}
                disabled={refreshing}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-[var(--text-muted)] hover:text-white hover:border-[#6C63FF]/40 transition disabled:opacity-60"
                aria-label="Refresh staff portal"
              >
                <RefreshCw size={18} className={cn(refreshing && "animate-spin text-[#6C63FF]")} />
              </button>
              <div className="hidden sm:flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="h-9 w-9 rounded-lg bg-[#6C63FF]/15 text-[#6C63FF] flex items-center justify-center">
                  <User size={17} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{user?.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Staff</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "overview" && (
              <Overview stats={stats} notes={notes} announcements={announcements} setActiveTab={setActiveTab} />
            )}
            {activeTab === "uploads" && <UploadManager notes={notes} onRefresh={syncData} />}
            {activeTab === "announcements" && <AnnouncementManager announcements={announcements} onRefresh={syncData} />}
            {activeTab === "engagement" && <EngagementPanel stats={stats} notes={notes} announcements={announcements} />}
            {activeTab === "analytics" && <AnalyticsPanel stats={stats} notes={notes} analytics={analytics} />}
            {activeTab === "profile" && <ProfilePanel profile={profile || user} stats={stats} onProfileUpdate={(next) => { setProfile(next); updateUser(next); }} />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function Overview({ stats, notes, announcements, setActiveTab }: { stats: any; notes: any[]; announcements: any[]; setActiveTab: (tab: Tab) => void }) {
  const recentNotes = notes.slice(0, 4);
  const recentAnnouncements = announcements.slice(0, 3);
  const quickActions = [
    { label: "Upload PDF", icon: UploadCloud, tab: "uploads" as Tab },
    { label: "Post Announcement", icon: Pin, tab: "announcements" as Tab },
    { label: "Upload Important Questions", icon: ClipboardList, tab: "uploads" as Tab },
    { label: "Upload Revision Material", icon: BookOpen, tab: "uploads" as Tab },
  ];
  const trending = [
    { label: "Most Downloaded", item: stats?.mostDownloadedUpload, value: `${stats?.mostDownloadedUpload?.downloads || 0} downloads` },
    { label: "Most Liked", item: stats?.mostLikedUpload, value: `${stats?.mostLikedUpload?.upvoteCount || 0} appreciations` },
    { label: "Exam Priority", item: stats?.examPriorityContent?.[0], value: `${stats?.examPriorityContent?.length || 0} priority items` },
  ];

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />

      <section className="glass-card p-5 border-white/10 bg-black/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display text-xl font-black text-white">Educator Workspace</h2>
            <p className="text-sm text-[var(--text-muted)]">Fast actions for the material students need most.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/10 px-4 py-2 text-xs font-bold text-[#b9b5ff]">
            <ShieldCheck size={14} />
            Staff verified content pipeline
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} onClick={() => setActiveTab(action.tab)} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/10 transition">
                <Icon size={20} className="text-[#6C63FF]" />
                <p className="mt-3 text-sm font-bold text-white">{action.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 glass-card p-5 border-white/10 bg-black/20">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-xl font-black text-white">Recent Staff Uploads</h2>
              <p className="text-sm text-[var(--text-muted)]">Latest materials available to students.</p>
            </div>
            <button onClick={() => setActiveTab("uploads")} className="btn-outline py-2 px-4 text-sm">Manage</button>
          </div>

          <div className="space-y-3">
            {recentNotes.map((note) => (
              <div key={note._id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{note.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{note.subject} / {note.department} / {note.semester}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1"><Download size={13} />{note.downloads || 0}</span>
                  <span className="inline-flex items-center gap-1"><Heart size={13} />{note.upvoteCount || 0}</span>
                  <span className="inline-flex items-center gap-1"><Eye size={13} />{note.views || 0}</span>
                </div>
              </div>
            ))}
            {recentNotes.length === 0 && <EmptyLine icon={BookOpen} text="No uploads yet. Add official PDFs from PDF Management." />}
          </div>
        </section>

        <section className="glass-card p-5 border-white/10 bg-black/20">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-xl font-black text-white">Announcement Feed</h2>
              <p className="text-sm text-[var(--text-muted)]">Your latest notices.</p>
            </div>
            <button onClick={() => setActiveTab("announcements")} className="btn-outline py-2 px-4 text-sm">Post</button>
          </div>

          <div className="space-y-3">
            {recentAnnouncements.map((ann) => (
              <div key={ann._id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-widest text-[#6C63FF] font-black">{ann.type}</p>
                <p className="mt-1 font-semibold text-white line-clamp-1">{ann.title}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">{ann.content}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>{timeAgo(ann.createdAt)}</span>
                  <span className="inline-flex items-center gap-1"><Heart size={13} />{ann.appreciationCount || 0}</span>
                </div>
              </div>
            ))}
            {recentAnnouncements.length === 0 && <EmptyLine icon={Award} text="No announcements posted yet." />}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 glass-card p-5 border-white/10 bg-black/20">
          <h2 className="font-display text-xl font-black text-white">Trending Content</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">High-signal material from downloads, appreciation, and exam tags.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trending.map((entry) => (
              <div key={entry.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-black">{entry.label}</p>
                <p className="mt-2 font-display text-base font-bold text-white line-clamp-2">{entry.item?.title || "No data yet"}</p>
                <p className="mt-2 text-xs text-[#00D4AA]">{entry.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-5 border-white/10 bg-black/20">
          <h2 className="font-display text-xl font-black text-white">Recent Comments</h2>
          <div className="mt-4 space-y-3">
            {(stats?.recentComments || []).slice(0, 3).map((comment: any) => (
              <div key={`${comment.noteId}-${comment.createdAt}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-semibold text-white line-clamp-1">{comment.title}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">{comment.text}</p>
              </div>
            ))}
            {(stats?.recentComments || []).length === 0 && <EmptyLine icon={MessageCircle} text="Student comments will appear here." />}
          </div>
        </section>
      </div>
    </div>
  );
}

function AnalyticsPanel({ stats, notes, analytics }: { stats: any; notes: any[]; analytics: any }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-black text-white">Staff Analytics</h2>
        <p className="text-sm text-[var(--text-muted)]">Readable engagement signals for your materials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric label="Uploads" value={notes.length} icon={BookOpen} />
        <Metric label="Downloads" value={analytics.totalDownloads} icon={Download} />
        <Metric label="Engagement" value={stats?.totalStudentInteractions || 0} icon={TrendingUp} />
        <Metric label="Trending Subject" value={stats?.trendingSubject || "No data"} icon={BarChart3} text />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="glass-card p-5 border-white/10 bg-black/20">
          <h3 className="font-display text-lg font-black text-white mb-4">Top Subjects</h3>
          <div className="space-y-3">
            {analytics.topSubjects.map(([subject, count]: [string, number]) => (
              <div key={subject}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-white">{subject}</span>
                  <span className="text-[var(--text-muted)]">{count} uploads</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00D4AA]" style={{ width: `${Math.min(100, (count / Math.max(1, notes.length)) * 100)}%` }} />
                </div>
              </div>
            ))}
            {analytics.topSubjects.length === 0 && <EmptyLine icon={BarChart3} text="Analytics will appear after uploads." />}
          </div>
        </section>

        <section className="glass-card p-5 border-white/10 bg-black/20">
          <h3 className="font-display text-lg font-black text-white mb-4">Recent Student Interactions</h3>
          <div className="space-y-3">
            {(stats?.recentInteractions || []).map((item: any) => (
              <div key={item.noteId} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-semibold text-white line-clamp-1">{item.title}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1"><Download size={13} />{item.downloads}</span>
                  <span className="inline-flex items-center gap-1"><Heart size={13} />{item.upvotes}</span>
                  <span className="inline-flex items-center gap-1"><Eye size={13} />{item.views}</span>
                </div>
              </div>
            ))}
            {(stats?.recentInteractions || []).length === 0 && <EmptyLine icon={TrendingUp} text="No student interactions yet." />}
          </div>
        </section>
      </div>
    </section>
  );
}

function EngagementPanel({ stats, notes, announcements }: { stats: any; notes: any[]; announcements: any[] }) {
  const highlights = [
    { label: "Appreciations", value: (stats?.totalUpvotes || 0) + (stats?.announcementAppreciations || 0), icon: Heart },
    { label: "Student Comments", value: stats?.totalComments || 0, icon: MessageCircle },
    { label: "Views", value: stats?.totalViews || 0, icon: Eye },
    { label: "Score", value: `${stats?.engagementScore || 0}%`, icon: Target },
  ];
  const topContent = notes
    .slice()
    .sort((a, b) => ((b.upvoteCount || 0) + (b.views || 0) + (b.downloads || 0)) - ((a.upvoteCount || 0) + (a.views || 0) + (a.downloads || 0)))
    .slice(0, 5);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-black text-white">Engagement Tracking</h2>
        <p className="text-sm text-[var(--text-muted)]">Appreciation, comments, and contribution momentum from students.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {highlights.map((item) => <Metric key={item.label} label={item.label} value={item.value} icon={item.icon} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 glass-card p-5 border-white/10 bg-black/20">
          <h3 className="font-display text-lg font-black text-white mb-4">Top Student Interactions</h3>
          <div className="space-y-3">
            {topContent.map((note) => (
              <div key={note._id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white line-clamp-1">{note.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{note.subject} / {(note.priority || "standard").replace("_", " ")}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1"><Download size={13} />{note.downloads || 0}</span>
                    <span className="inline-flex items-center gap-1"><Heart size={13} />{note.upvoteCount || 0}</span>
                    <span className="inline-flex items-center gap-1"><Eye size={13} />{note.views || 0}</span>
                  </div>
                </div>
              </div>
            ))}
            {topContent.length === 0 && <EmptyLine icon={Target} text="Engagement will appear after students interact." />}
          </div>
        </section>
        <section className="glass-card p-5 border-white/10 bg-black/20">
          <h3 className="font-display text-lg font-black text-white mb-4">Contribution Highlights</h3>
          <div className="space-y-3">
            <Highlight label="Trusted Contributor" active={(stats?.totalUploads || 0) >= 5} />
            <Highlight label="Exam Support Builder" active={(stats?.examPriorityContent?.length || 0) >= 2} />
            <Highlight label="Student Appreciated" active={((stats?.totalUpvotes || 0) + (stats?.announcementAppreciations || 0)) >= 10} />
            <Highlight label="Notice Board Active" active={announcements.length >= 3} />
          </div>
        </section>
      </div>
    </section>
  );
}

function ProfilePanel({ profile, stats, onProfileUpdate }: { profile: any; stats: any; onProfileUpdate: (user: any) => void }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    avatar: profile?.avatar || "",
    bio: profile?.bio || "",
    department: profile?.department || "",
    designation: profile?.designation || "",
    subjectsHandled: (profile?.subjectsHandled || []).join(", "),
    college: profile?.college || "Sathyabama University",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: profile?.name || "",
      avatar: profile?.avatar || "",
      bio: profile?.bio || "",
      department: profile?.department || "",
      designation: profile?.designation || "",
      subjectsHandled: (profile?.subjectsHandled || []).join(", "),
      college: profile?.college || "Sathyabama University",
    });
  }, [profile]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await staffAPI.updateProfile(form);
      onProfileUpdate(res.data.user);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <form onSubmit={submit} className="xl:col-span-2 glass-card p-6 border-white/10 bg-black/20 space-y-4">
        <div>
          <h2 className="font-display text-2xl font-black text-white">Staff Profile & Settings</h2>
          <p className="text-sm text-[var(--text-muted)]">Maintain the educator identity students see around official material.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <Field label="Designation" value={form.designation} onChange={(value) => setForm({ ...form, designation: value })} placeholder="Assistant Professor" />
          <Select label="Department" value={form.department} onChange={(value) => setForm({ ...form, department: value })} options={DEPARTMENTS} />
          <Field label="Profile Photo URL" value={form.avatar} onChange={(value) => setForm({ ...form, avatar: value })} placeholder="https://..." />
        </div>
        <Field label="Subjects Handled" value={form.subjectsHandled} onChange={(value) => setForm({ ...form, subjectsHandled: value })} placeholder="Data Structures, DBMS, Networks" />
        <label className="block">
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Bio</span>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={5} className="input-field resize-none" placeholder="Short academic bio for students..." />
        </label>
        <button type="submit" disabled={saving} className="btn-brand py-3 px-5 text-sm disabled:opacity-60">
          <Settings size={16} />
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
      <aside className="glass-card p-6 border-white/10 bg-black/20">
        <div className="flex items-center gap-4">
          <img src={form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || "Staff")}&background=6C63FF&color=fff&bold=true&size=96`} alt={form.name} className="h-16 w-16 rounded-2xl object-cover border border-white/10" />
          <div className="min-w-0">
            <p className="font-display text-xl font-black text-white truncate">{form.name || "Staff Member"}</p>
            <p className="text-sm text-[var(--text-muted)]">{form.designation || "Faculty Staff"}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <MiniStat label="Uploads" value={stats?.totalUploads || 0} />
          <MiniStat label="Downloads" value={stats?.totalDownloads || 0} />
          <MiniStat label="Engagement" value={stats?.totalStudentInteractions || 0} />
          <MiniStat label="Score" value={`${stats?.engagementScore || 0}%`} />
        </div>
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Subjects</p>
          <p className="mt-2 text-sm text-white">{form.subjectsHandled || "No subjects listed yet"}</p>
        </div>
      </aside>
    </section>
  );
}

function Highlight({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border p-3", active ? "border-[#00D4AA]/30 bg-[#00D4AA]/10 text-[#00D4AA]" : "border-white/10 bg-white/[0.03] text-[var(--text-muted)]")}>
      <Award size={17} />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-black">{label}</p>
      <p className="mt-1 font-display text-xl font-black text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
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

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field">
        <option value="" className="bg-[#111827]">Select {label.toLowerCase()}</option>
        {options.map((option) => <option key={option} value={option} className="bg-[#111827]">{option}</option>)}
      </select>
    </label>
  );
}

function Metric({ label, value, icon: Icon, text = false }: { label: string; value: string | number; icon: any; text?: boolean }) {
  return (
    <div className="glass-card p-5 border-white/10 bg-black/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
          <p className={cn("mt-2 font-display font-black text-white", text ? "text-lg truncate" : "text-3xl")}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div className="rounded-xl border border-[#6C63FF]/25 bg-[#6C63FF]/10 p-3 text-[#6C63FF]">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function EmptyLine({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-[var(--text-muted)]">
      <Icon size={24} className="mx-auto mb-2 opacity-60" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
