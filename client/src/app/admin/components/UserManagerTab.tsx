"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Ban, 
  History, 
  ShieldAlert, 
  User,
  Calendar,
  Layers,
  Send,
  X,
  FileDown,
  Sparkles
} from "lucide-react";
import { moderatorAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

interface UserManagementProps {
  users: any[];
  onRefresh: () => void;
}

export default function UserManagerTab({ users, onRefresh }: UserManagementProps) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [sendingWarning, setSendingWarning] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSuspend = async (id: string) => {
    try {
      const res = await moderatorAPI.suspendUser(id);
      const isBlockedNow = res.data.user.isBlocked;
      toast.success(isBlockedNow ? "STUDENT SUSPENDED TEMPORARILY" : "STUDENT RESTORED TO ACTIVE STATUS");
      
      // Update state for selected user if open
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser({ ...selectedUser, isBlocked: isBlockedNow });
      }
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "SUSPEND TRANSACTION DENIED");
    }
  };

  const handleSendDirectWarning = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    if (!warningMessage.trim()) return;
    setSendingWarning(true);

    try {
      await moderatorAPI.warnUser(userId, warningMessage.trim());
      toast.success("DIRECT WARN DISPATCHED SUCCESSFULLY");
      setWarningMessage("");
    } catch {
      toast.error("WARNING FEED ERROR — FEED DISCOVERY INTERRUPT");
    } finally {
      setSendingWarning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative font-mono text-xs">
      
      {/* Student Registry List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search students by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.04] backdrop-blur-xl rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.02] focus:shadow-[0_0_20px_rgba(59,130,246,0.06)] transition-all font-mono"
          />
        </div>

        <div className="rounded-3xl border border-white/[0.04] bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white/[0.01] text-gray-500 font-mono text-[9px] uppercase tracking-widest border-b border-white/[0.04]">
                <tr>
                  <th className="px-6 py-4.5">Student Entity</th>
                  <th className="px-6 py-4.5">Department</th>
                  <th className="px-6 py-4.5 text-center">Status</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map((u) => (
                  <motion.tr 
                    key={u._id}
                    layout
                    className={`hover:bg-white/[0.01] transition-all cursor-pointer group ${selectedUser?._id === u._id ? "bg-white/[0.02]" : ""}`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} className="text-gray-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-semibold font-sans text-xs group-hover:text-blue-400 transition-colors truncate max-w-[150px]">
                            {u.name}
                          </div>
                          <div className="text-[9px] text-gray-500 mt-0.5 truncate max-w-[150px]">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-[10px] text-gray-300 font-bold uppercase">{u.department || "UNSPECIFIED"}</span>
                      {u.college && <div className="text-[8px] text-gray-500 mt-0.5 uppercase truncate max-w-[120px]">{u.college}</div>}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        u.isBlocked 
                          ? "text-red-400 border-red-500/20 bg-red-500/5 shadow-[0_0_6px_rgba(239,68,68,0.1)]" 
                          : "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_6px_rgba(16,185,129,0.1)]"
                      }`}>
                        {u.isBlocked ? "SUSPENDED" : "ACTIVE"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {/* Prevent admins demoting or blocking other admins or superadmins */}
                      {u.role !== "superadmin" && u.role !== "admin" ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSuspend(u._id); }}
                          className={`p-2.5 rounded-xl border transition-all ${
                            u.isBlocked 
                              ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20" 
                              : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5"
                          }`}
                          title={u.isBlocked ? "Restore Clearance" : "Suspend Student"}
                        >
                          <Ban size={13} />
                        </button>
                      ) : (
                        <span className="text-[8px] text-gray-600 font-bold tracking-wider uppercase pr-2">PROTECTED</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-16 text-center text-gray-600 font-mono text-xs tracking-widest uppercase">
            NO STUDENT ENTRIES INGESTED MATCHING QUERY
          </div>
        )}
      </div>

      {/* Sliding Student Intel Drawer (Right Side) */}
      <div className="lg:col-span-1">
        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div 
              key={selectedUser._id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="rounded-3xl border border-white/[0.04] bg-black/40 backdrop-blur-xl p-6 sticky top-24 shadow-2xl relative overflow-hidden"
            >
              {/* Top ambient glowing ring */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              
              <div className="text-center mb-6 relative z-10">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 mx-auto mb-3.5 shadow-lg relative">
                  <div className="absolute inset-0.5 rounded-[22px] bg-black pointer-events-none z-0" />
                  <div className="w-full h-full rounded-[22px] bg-black flex items-center justify-center overflow-hidden relative z-10">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-gray-700" />
                    )}
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-white font-sans truncate max-w-[200px] mx-auto">{selectedUser.name}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[220px] mx-auto">{selectedUser.email}</p>
                
                <div className="mt-3.5 flex items-center justify-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[8px] text-blue-400 font-bold uppercase tracking-wider">
                    {selectedUser.role}
                  </span>
                  <span className="text-gray-700">•</span>
                  <span className="text-[8px] text-gray-500 font-bold">JOINED {timeAgo(selectedUser.createdAt).toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                {/* Upload Metrics */}
                <div className="space-y-2.5">
                  <h4 className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
                    <History size={11} /> File Telemetry Logs
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col p-3 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                      <span className="text-[8px] text-gray-600 font-bold uppercase">UPLOADS</span>
                      <span className="text-lg font-black text-white mt-1">{selectedUser.uploadCount || 0}</span>
                    </div>
                    <div className="flex flex-col p-3 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                      <span className="text-[8px] text-gray-600 font-bold uppercase">REPORTS</span>
                      <span className="text-lg font-black text-amber-500 mt-1">0</span>
                    </div>
                  </div>
                </div>

                {/* Direct Warnings Console */}
                {selectedUser.role !== "superadmin" && selectedUser.role !== "admin" && (
                  <div className="space-y-2.5">
                    <h4 className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
                      <Sparkles size={11} className="text-blue-400" /> Direct warning console
                    </h4>
                    
                    <form onSubmit={(e) => handleSendDirectWarning(e, selectedUser._id)} className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          required
                          placeholder="Send standard or custom warning..."
                          value={warningMessage}
                          onChange={(e) => setWarningMessage(e.target.value)}
                          className="flex-1 bg-white/[0.01] border border-white/[0.05] rounded-xl px-3 py-2 text-[9px] text-white focus:outline-none focus:border-blue-500/20 focus:bg-white/[0.02] transition-all font-mono"
                        />
                        <button 
                          type="submit"
                          disabled={sendingWarning || !warningMessage.trim()}
                          className="px-3 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shadow-lg"
                        >
                          <Send size={9} />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Security Actions Block */}
                {selectedUser.role !== "superadmin" && selectedUser.role !== "admin" && (
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.04]">
                    <h4 className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldAlert size={11} className="text-red-400" /> Command clearance deck
                    </h4>
                    
                    <button 
                      onClick={() => handleSuspend(selectedUser._id)}
                      className={`w-full py-3 rounded-2xl font-bold text-[10px] tracking-widest transition-all duration-300 border ${
                        selectedUser.isBlocked 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                          : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {selectedUser.isBlocked ? "RESTORE CLEARANCE" : "SUSPEND CLEARANCE"}
                    </button>
                    <p className="text-[8px] text-gray-600 italic text-center leading-normal">
                      {selectedUser.isBlocked 
                        ? "Restores user access privileges immediately." 
                        : "Bans user access from student portals and catalogues."}
                    </p>
                  </div>
                )}
              </div>

            </motion.div>
          ) : (
            <div className="rounded-3xl border border-white/[0.04] bg-black/40 backdrop-blur-xl p-12 text-center flex flex-col items-center justify-center gap-4 sticky top-24 shadow-lg min-h-[360px]">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-600">
                <User size={24} />
              </div>
              <p className="text-gray-600 font-mono text-[9px] max-w-[130px] tracking-widest uppercase leading-normal">
                SELECT STUDENT ENTITY TO AUDIT INTEL
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
