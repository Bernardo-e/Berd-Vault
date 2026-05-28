"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Check, 
  X, 
  ShieldAlert, 
  User, 
  Trash2,
  Lock,
  Unlock,
  Radio,
  Fingerprint
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface Request {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  role: string;
}

interface RequestsProps {
  requests: Request[];
  users: any[];
  onRefresh: () => void;
}

export default function EliteRequestPanel({ requests, users, onRefresh }: RequestsProps) {
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  // Filter active admins from all user entities
  const activeAdmins = users.filter((u) => u.role === "admin");

  const handleApprove = async (id: string) => {
    setActionInProgress(id);
    try {
      await adminAPI.approve(id);
      toast.success("ADMIN CLEARANCE GRANTED", {
        style: { background: '#07070c', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }
      });
      onRefresh();
    } catch { 
      toast.error("Protocol failed"); 
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionInProgress(id);
    try {
      await adminAPI.reject(id);
      toast.success("REQUEST DENIED", {
        style: { background: '#07070c', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)' }
      });
      onRefresh();
    } catch { 
      toast.error("Protocol failed"); 
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Confirm revocation of admin privileges? User will be reset to student role.")) return;
    setActionInProgress(id);
    try {
      await adminAPI.remove(id);
      toast.success("ADMIN CLEARANCE REVOKED", {
        style: { background: '#07070c', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }
      });
      onRefresh();
    } catch { 
      toast.error("Revocation failed"); 
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* ── Pending Requests Column (7 cols) ── */}
      <div className="lg:col-span-7 space-y-5">
        <div className="p-4 rounded-2xl bg-[#07070c]/50 border border-white/[0.04] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Pending Requests
              {requests.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              )}
            </h3>
            <p className="text-[9px] text-gray-500 font-mono tracking-wider mt-0.5">{requests.length} NODES AWAITING AUTH</p>
          </div>
          <Fingerprint size={16} className="text-gray-600" />
        </div>

        <AnimatePresence mode="popLayout">
          {requests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center rounded-2xl border border-white/[0.04] bg-[#07070c]/20"
            >
              <Lock size={32} className="text-gray-800 mx-auto mb-4" />
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">Authorization Queue Clear</p>
              <p className="text-[9px] text-gray-600 font-mono tracking-wider mt-1.5">No pending admin authorization nodes detected</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {requests.map((req, idx) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-5 rounded-2xl bg-[#07070c]/50 border border-white/[0.04] hover:bg-[#07070c]/70 hover:border-white/[0.08] transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                    actionInProgress === req._id ? "opacity-50 pointer-events-none" : ""
                  }`}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                      {req.avatar ? (
                        <img src={req.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-indigo-400" />
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-white text-sm tracking-tight truncate font-sans">{req.name}</h4>
                        <span className="text-[7.5px] font-mono text-gray-500">#{req._id?.slice(-4)}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono truncate mt-0.5">{req.email}</p>
                      {req.department && (
                        <p className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest mt-1.5 font-black">{req.department}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 self-end md:self-auto">
                    <button
                      onClick={() => handleReject(req._id)}
                      className="px-3.5 py-2 rounded-lg border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-mono font-bold text-[9px] uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5"
                    >
                      <X size={12} /> Deny
                    </button>
                    <button
                      onClick={() => handleApprove(req._id)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[9px] uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 shadow-lg shadow-indigo-950/40"
                    >
                      <Check size={12} /> Authorize
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Active Admin Roster Column (5 cols) ── */}
      <div className="lg:col-span-5 space-y-5">
        <div className="p-4 rounded-2xl bg-[#07070c]/50 border border-white/[0.04] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Active Roster
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            </h3>
            <p className="text-[9px] text-gray-500 font-mono tracking-wider mt-0.5">{activeAdmins.length} LEVEL_01 CLEARANCES</p>
          </div>
          <Shield size={16} className="text-gray-600" />
        </div>

        <AnimatePresence mode="popLayout">
          {activeAdmins.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center rounded-2xl border border-white/[0.04] bg-[#07070c]/20"
            >
              <ShieldAlert size={32} className="text-gray-800 mx-auto mb-4" />
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">No Active Admins</p>
              <p className="text-[9px] text-gray-600 font-mono tracking-wider mt-1.5">No verified administrators are registered</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {activeAdmins.map((ad, idx) => (
                <motion.div
                  key={ad._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-2xl bg-[#07070c]/50 border border-white/[0.04] hover:bg-[#07070c]/70 hover:border-white/[0.08] transition-all duration-300 flex items-center justify-between gap-4 ${
                    actionInProgress === ad._id ? "opacity-50 pointer-events-none" : ""
                  }`}
                  whileHover={{ y: -1 }}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                      {ad.avatar ? (
                        <img src={ad.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-purple-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-white text-xs tracking-tight truncate font-sans">{ad.name}</h4>
                      <p className="text-[9.5px] text-gray-500 font-mono truncate">{ad.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(ad._id)}
                    className="p-2 hover:bg-rose-500/10 rounded-lg text-gray-500 hover:text-rose-400 border border-transparent hover:border-rose-500/15 transition-all duration-200 shrink-0"
                    title="Revoke clearance"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
