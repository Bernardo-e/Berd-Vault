"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Upload, Users, Star,
  TrendingUp, Zap, Shield, Search, ChevronRight
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NoteCard from "@/components/ui/NoteCard";
import { notesAPI } from "@/lib/api";

const features = [
  { icon: <Upload size={22}/>, title: "Easy Upload",      desc: "Drag & drop your PDFs and docs in seconds. Instantly share with thousands of students." },
  { icon: <Search size={22}/>, title: "Smart Search",     desc: "Find notes by college, department, year, semester, or subject with blazing-fast results." },
  { icon: <Star size={22}/>,   title: "Quality Ratings",  desc: "Community-driven ratings ensure only the best notes rise to the top." },
  { icon: <Shield size={22}/>, title: "Secure & Reliable",desc: "Your files are safely stored in the cloud. Download anytime, anywhere." },
];

export default function LandingPage() {
  const [trending, setTrending] = useState<any[]>([]);
  const [recent, setRecent]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [liveUsers, setLiveUsers] = useState(1);

  useEffect(() => {
    // Live count set to 1
  }, []);

  useEffect(() => {
    Promise.all([notesAPI.getTrending(), notesAPI.getRecent()])
      .then(([t, r]) => { setTrending(t.data.notes || []); setRecent(r.data.notes || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cardVariants: any = {
    hidden:  { opacity: 0, y: 40 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } })
  };

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-4 overflow-hidden">
        {/* Glowing orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-[#6C63FF]/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full bg-[#00D4AA]/15 blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6C63FF]/15 border border-[#6C63FF]/30 text-sm font-medium text-[#6C63FF]">
              <Zap size={13} className="fill-[#6C63FF]" />
              <span>The #1 Sathyabama Notes Platform</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00D4AA]/15 border border-[#00D4AA]/30 text-sm font-medium text-[#00D4AA]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D4AA]"></span>
              </span>
              <span>{liveUsers.toLocaleString()} Live Members</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Share Knowledge.{" "}
            <span className="gradient-text block sm:inline">Ace Everything.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Berd Vault is where engineering students upload, discover, and download
            top-rated study notes — organized by college, department, and semester.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/browse" className="btn-brand text-base px-8 py-3.5">
              Browse Notes <ArrowRight size={18} />
            </Link>
            <Link href="/auth?tab=register" className="btn-outline text-base px-8 py-3.5">
              <Upload size={18} /> Upload Your Notes
            </Link>
          </motion.div>
        </div>

      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              Built for <span className="gradient-text">serious students</span>
            </h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              Every feature was designed to make studying smarter, faster, and more collaborative.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariants}
                className="glass-card p-6 flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4AA]/20 flex items-center justify-center text-[#6C63FF]">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trending ─────────────────────────────────────── */}
      {(trending.length > 0 || loading) && (
        <section className="py-20 px-4 bg-[var(--bg-subtle)]/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <TrendingUp size={22} className="text-[#6C63FF]" />
                <h2 className="font-display text-3xl font-bold">Trending Notes</h2>
              </div>
              <Link href="/browse?sort=popular" className="flex items-center gap-1 text-sm text-[#6C63FF] hover:underline">
                View all <ChevronRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="glass-card p-5 h-52">
                    <div className="skeleton h-8 w-8 rounded-xl mb-3" />
                    <div className="skeleton h-4 w-3/4 mb-2" />
                    <div className="skeleton h-3 w-1/2 mb-4" />
                    <div className="skeleton h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {trending.slice(0, 4).map((note, i) => (
                  <NoteCard key={note._id} note={note} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Recently Added ──────────────────────────────── */}
      {(recent.length > 0 || loading) && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <BookOpen size={22} className="text-[#00D4AA]" />
                <h2 className="font-display text-3xl font-bold">Recently Added</h2>
              </div>
              <Link href="/browse?sort=newest" className="flex items-center gap-1 text-sm text-[#6C63FF] hover:underline">
                View all <ChevronRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="glass-card p-5 h-52">
                    <div className="skeleton h-4 w-full mb-2" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recent.slice(0, 4).map((note, i) => (
                  <NoteCard key={note._id} note={note} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── CTA Banner ───────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/10 to-[#00D4AA]/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users size={20} className="text-[#6C63FF]" />
                <span className="text-sm font-medium text-[#6C63FF]">Join 12,000+ Sathyabama students</span>
              </div>
              <h2 className="font-display text-4xl font-bold mb-4">
                Ready to ace your exams?
              </h2>
              <p className="text-[var(--text-muted)] mb-8 max-w-lg mx-auto">
                Create a free account in 30 seconds and get instant access to thousands of high-quality notes.
              </p>
              <Link href="/auth?tab=register" className="btn-brand text-base px-10 py-3.5">
                Get Started Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
