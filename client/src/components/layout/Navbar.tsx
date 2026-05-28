"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sun, Moon, Bell, Upload, BookOpen, LogOut,
  User, LayoutDashboard, Menu, X, ChevronDown, Zap
} from "lucide-react";
import { useAuthStore, useThemeStore } from "@/lib/store";
import { usersAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const navLinks = [
  { href: "/browse",    label: "Browse",    icon: <BookOpen size={16}/> },
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16}/> },
  { href: "/upload",    label: "Upload",    icon: <Upload size={16}/> },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { examMode, toggleExamMode } = useThemeStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/browse?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const fetchNotifs = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await usersAPI.getNotifications();
      setNotifications(res.data.notifications);
    } catch {}
  };

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-white/10 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center shadow-glow">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">Berd Vault</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-[#6C63FF]/20 text-[#6C63FF]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
              <input
                type="text"
                placeholder="Search notes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field !pl-10 py-2 text-sm h-9"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Exam Mode Toggle (Students Only) */}
            {isAuthenticated && user?.role === "student" && (
              <button
                onClick={toggleExamMode}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-9 rounded-xl border transition font-medium text-xs sm:text-sm",
                  examMode 
                    ? "bg-[#6C63FF]/20 border-[#6C63FF] text-[#6C63FF] shadow-[0_0_10px_rgba(108,99,255,0.4)]"
                    : "bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-muted)] hover:border-[#6C63FF]/50"
                )}
                aria-label="Toggle Exam Mode"
              >
                 <Zap size={14} className={examMode ? "fill-[#6C63FF]" : ""} />
                 <span className="hidden sm:inline">{examMode ? "Exam Mode ON" : "Exam Mode"}</span>
              </button>
            )}



            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); fetchNotifs(); }}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center transition hover:border-[#6C63FF]/50 relative"
                  >
                    <Bell size={16} className="text-[var(--text-muted)]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6C63FF] text-white text-[10px] flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-72 glass rounded-2xl p-2 shadow-glass-lg"
                      >
                        <p className="px-3 py-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          Notifications
                        </p>
                        {notifications.length === 0
                          ? <p className="px-3 py-4 text-sm text-[var(--text-faint)] text-center">No notifications</p>
                          : notifications.slice(0, 5).map((n: any, i: number) => (
                            <div key={i} className={cn(
                              "px-3 py-2 rounded-xl text-sm",
                              !n.read && "bg-[#6C63FF]/10"
                            )}>
                              {n.message}
                              <p className="text-xs text-[var(--text-faint)] mt-0.5">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        }
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] transition hover:border-[#6C63FF]/50"
                  >
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=6C63FF&color=fff&bold=true`}
                      alt={user?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium hidden sm:block max-w-[80px] truncate">{user?.name}</span>
                    <ChevronDown size={14} className={cn("text-[var(--text-muted)] transition-transform", profileOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-52 glass rounded-2xl p-2 shadow-glass-lg"
                      >
                        <Link href={`/profile/${user?._id}`} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-[var(--bg-subtle)] transition">
                          <User size={15} /> My Profile
                        </Link>
                        <Link href="/upload" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-[var(--bg-subtle)] transition">
                          <Upload size={15} /> Upload Notes
                        </Link>
                        {(user?.role === "admin" || user?.role === "superadmin") && (
                          <Link 
                            href={user?.role === "superadmin" ? "/super-admin" : "/admin"} 
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-[var(--bg-subtle)] transition text-[#6C63FF]"
                          >
                            <LayoutDashboard size={15} /> {user?.role === "superadmin" ? "Super Admin" : "Admin Panel"}
                          </Link>
                        )}
                        <hr className="my-1 border-[var(--border)]" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition"
                        >
                          <LogOut size={15} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth" className="btn-outline py-2 px-4 text-sm">Login</Link>
                <Link href="/auth?tab=register" className="btn-brand py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden glass border-t border-[var(--border)] mt-3"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              <form onSubmit={handleSearch} className="mb-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
                  <input
                    placeholder="Search notes…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field !pl-10 py-2 text-sm h-9"
                  />
                </div>
              </form>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--bg-subtle)] transition">
                  {link.icon} {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex gap-2 mt-2">
                  <Link href="/auth" className="btn-outline py-2 px-4 text-sm flex-1 justify-center">Login</Link>
                  <Link href="/auth?tab=register" className="btn-brand py-2 px-4 text-sm flex-1 justify-center">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
