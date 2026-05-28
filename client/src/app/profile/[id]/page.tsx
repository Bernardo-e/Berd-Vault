"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Download, BookOpen, Edit3, Check, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NoteCard from "@/components/ui/NoteCard";
import { usersAPI } from "@/lib/api";
import { useAuthStore, DEPARTMENTS, YEARS } from "@/lib/store";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: me, isAuthenticated, updateUser } = useAuthStore();

  const [profile,  setProfile]  = useState<any>(null);
  const [notes,    setNotes]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", college: "Sathyabama University", department: "", year: "" });
  const [isHydrated, setIsHydrated] = useState(false);

  const isOwn = isHydrated && me?._id === id;

  useEffect(() => {
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        setTimeout(checkHydration, 50);
      }
    };
    checkHydration();
  }, []);

  useEffect(() => {
    if (!id) return;
    usersAPI.getProfile(id as string)
      .then(res => {
        setProfile(res.data.user);
        setNotes(res.data.notes || []);
        setForm({
          name:       res.data.user.name,
          bio:        res.data.user.bio || "",
          college:    "Sathyabama University",
          department: res.data.user.department || "",
          year:       res.data.user.year || "",
        });
      })
      .catch(() => toast.error("Profile not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, college: "Sathyabama University" };
      const res = await usersAPI.updateProfile(payload);
      setProfile(res.data.user);
      updateUser(res.data.user);
      setEditing(false);
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  };

  if (loading || !isHydrated) {
    return (
      <div className="mesh-bg min-h-screen">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-28 pb-20 space-y-5">
          <div className="skeleton h-40 w-full rounded-2xl" />
          <div className="skeleton h-64 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mesh-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">👤</p>
          <h2 className="font-display text-2xl font-bold mb-2">User not found</h2>
          <Link href="/" className="btn-brand py-2 px-6 text-sm mt-4 inline-flex">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">

        {/* Profile hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/10 to-[#00D4AA]/10 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center">

            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6C63FF&color=fff&bold=true&size=160`}
                alt={profile.name}
                className="w-24 h-24 rounded-2xl ring-2 ring-[#6C63FF]/30 object-cover"
              />
              {profile.role === "admin" && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 badge badge-brand text-[10px] whitespace-nowrap">Admin</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              {editing && isOwn ? (
                <div className="space-y-3">
                  <input className="input-field font-display font-bold text-xl" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Your name" />
                  <textarea className="input-field resize-none text-sm" rows={2} value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Short bio…" />
                  <div className="grid grid-cols-3 gap-2">
                    <input className="input-field text-sm py-2 cursor-not-allowed bg-white/5 opacity-60" value="Sathyabama University" disabled placeholder="College" />
                    <select className="input-field text-sm py-2" value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))}>
                      <option value="">Dept…</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className="input-field text-sm py-2" value={form.year} onChange={e => setForm(f => ({...f, year: e.target.value}))}>
                      <option value="">Year…</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
                  {profile.bio && <p className="text-[var(--text-muted)] text-sm mt-1">{profile.bio}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.college    && <span className="badge badge-brand">{profile.college}</span>}
                    {profile.department && <span className="badge badge-teal">{profile.department}</span>}
                    {profile.year       && <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-1 rounded-full border border-[var(--border)]">{profile.year}</span>}
                  </div>
                  <p className="text-xs text-[var(--text-faint)] mt-2">Member since {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</p>
                </div>
              )}
            </div>

            {/* Edit controls */}
            {isOwn && (
              <div className="flex gap-2 shrink-0">
                {editing ? (
                  <>
                    <button onClick={handleSave} disabled={saving} className="btn-brand py-2 px-4 text-sm">
                      {saving ? "Saving…" : <><Check size={15}/> Save</>}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-outline py-2 px-4 text-sm">
                      <X size={15}/> Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="btn-outline py-2 px-4 text-sm">
                    <Edit3 size={15}/> Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="relative flex justify-center gap-12 mt-8 pt-6 border-t border-[var(--border)]">
            {[
              { label: "Notes Uploaded", value: profile.uploadCount || notes.length, icon: <Upload size={16}/> },
              { label: "Total Downloads", value: profile.downloadCount || 0,          icon: <Download size={16}/> },
              { label: "Notes Shared",   value: notes.length,                         icon: <BookOpen size={16}/> },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-[#6C63FF] mb-1">{s.icon}</div>
                <p className="font-display font-bold text-2xl">{s.value}</p>
                <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-display text-xl font-bold mb-5">
            {isOwn ? "Your Uploads" : `Notes by ${profile.name}`}
          </h2>

          {notes.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-4xl mb-4">📂</p>
              <h3 className="font-display text-xl font-semibold mb-2">No notes yet</h3>
              {isOwn && (
                <>
                  <p className="text-[var(--text-muted)] text-sm mb-6">Share your first set of notes with the community!</p>
                  <Link href="/upload" className="btn-brand py-2 px-6 text-sm inline-flex">
                    <Upload size={16}/> Upload Notes
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {notes.map((note, i) => <NoteCard key={note._id} note={note} index={i} />)}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
