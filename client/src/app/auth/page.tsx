"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Zap, ArrowRight, Shield } from "lucide-react";
import { authAPI } from "@/lib/api";
import { useAuthStore, DEPARTMENTS, YEARS } from "@/lib/store";
import toast from "react-hot-toast";
import Link from "next/link";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { cn } from "@/lib/utils";

const Spinner = () => (
  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

function AuthForm() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login"
  );
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    college: "Sathyabama University", department: "", year: "",
    role: "student" as "student" | "staff" | "admin"
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const [adminRegistered, setAdminRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Minimum loading time for animation effect
    const startTime = Date.now();

    try {
      const res = tab === "login"
        ? await authAPI.login({ email: form.email, password: form.password, role: form.role })
        : await authAPI.register(form);
      
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) await new Promise(r => setTimeout(r, 1000 - elapsed));

      if (tab === "register" && form.role === "admin") {
        setAdminRegistered(true);
        setLoading(false);
        return;
      }

      setAuth(res.data.user, res.data.token);
      toast.success(tab === "login" ? "Welcome back! 🎉" : "Account created! 🚀");
      router.push(res.data.user?.role === "staff" ? "/staff" : "/dashboard");
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));
      
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Something went wrong";
      toast.error(msg);
      setLoading(false); 
    }
  };

  if (adminRegistered) {
    return (
      <div className="mesh-bg min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        <div className="glass-card p-10 max-w-md w-full text-center relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Shield className="text-amber-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold font-display mb-4">Request Submitted</h2>
          <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
            Your admin request for <span className="text-white font-medium">{form.email}</span> is now pending. 
            A Super Admin will review your profile shortly. You will be able to log in once approved.
          </p>
          <button 
            onClick={() => { setAdminRegistered(false); setTab("login"); }}
            className="btn-brand w-full justify-center"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {loading && <LoadingScreen />}
      {/* Glowing orbs */}
      <div className="fixed top-0 left-1/3 w-72 h-72 rounded-full bg-[#6C63FF]/20 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/3 w-64 h-64 rounded-full bg-[#00D4AA]/15 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center shadow-glow">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl gradient-text">Berd Vault</span>
        </Link>

        <div className="glass-card p-8">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-[var(--bg-subtle)] p-1 mb-6">
            {(["login", "register"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setAdminRegistered(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  tab === t
                    ? "bg-[#6C63FF] text-white shadow-glow"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Role Selection */}
              <div className="flex gap-2 mb-2 p-1 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border)]">
                {(["student", "staff", "admin"] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => update("role", r)}
                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                      form.role === r
                        ? "bg-[#6C63FF] text-white shadow-md"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {tab === "login" ? (
                <>
                  <h2 className="font-display text-xl font-bold text-center">Welcome back</h2>
                  <Field icon={<Mail size={16}/>} type="email"    placeholder="Email address"   value={form.email}    onChange={(v: string) => update("email", v)} />
                  <div className="relative">
                    <Field icon={<Lock size={16}/>} type={showPass ? "text" : "password"} placeholder="Password" value={form.password} onChange={(v: string) => update("password", v)} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)]">
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl font-bold text-center">Create account</h2>
                  <Field icon={<User size={16}/>}     type="text"  placeholder="Full name"       value={form.name}    onChange={(v: string) => update("name", v)} />
                  <Field icon={<Mail size={16}/>}     type="email" placeholder="Email address"   value={form.email}   onChange={(v: string) => update("email", v)} />
                  <div className="relative">
                    <Field icon={<Lock size={16}/>} type={showPass ? "text" : "password"} placeholder="Password (min 6 chars)" value={form.password} onChange={(v: string) => update("password", v)} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)]">
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  
                  {form.role !== "admin" && (
                    <div className={cn("grid gap-3", form.role === "staff" ? "grid-cols-1" : "grid-cols-2")}>
                      <SelectField value={form.department} onChange={(v: string) => update("department", v)} placeholder="Dept" options={DEPARTMENTS} />
                      {form.role === "student" && (
                        <SelectField value={form.year} onChange={(v: string) => update("year", v)} placeholder="Year" options={YEARS} />
                      )}
                    </div>
                  )}

                  {form.role === "admin" && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500/80 font-medium text-center leading-relaxed">
                      Registering as an Admin will require manual approval from the Super Admin.
                    </div>
                  )}
                </>
              )}

              <button type="submit" disabled={loading} className="btn-brand w-full justify-center mt-2 h-12 relative overflow-hidden">
                <span className={cn("flex items-center gap-2 transition-all", loading ? "opacity-0 scale-95" : "opacity-100 scale-100")}>
                  {tab === "login" 
                    ? "Sign In" 
                    : (form.role === "admin" ? "Request Permission" : "Create Account")
                  } 
                  <ArrowRight size={16}/>
                </span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner />
                  </div>
                )}
              </button>

              <p className="text-center text-sm text-[var(--text-muted)]">
                {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => setTab(tab === "login" ? "register" : "login")} className="text-[#6C63FF] font-medium hover:underline">
                  {tab === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, type, placeholder, value, onChange }: any) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)]">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={type !== "text" || placeholder.includes("required")}
        className="input-field !pl-12"
      />
    </div>
  );
}

function SelectField({ value, onChange, placeholder, options }: any) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="input-field">
      <option value="">{placeholder}</option>
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}


export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>;
}
