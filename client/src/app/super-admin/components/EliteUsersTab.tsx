"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Shield, 
  Ban, 
  Trash2, 
  ChevronRight,
  Activity,
  Award,
  AlertCircle
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface UsersTabProps {
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  onRefresh: () => void;
}

export default function EliteUsersTab({ users, setUsers, onRefresh }: UsersTabProps) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter(u => 
    (roleFilter === "all" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await adminAPI.changeRole(id, role);
      toast.success(`Entity role updated to: ${role.toUpperCase()}`, {
        style: { background: '#07070c', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' }
      });
      // Update selected user local view as well
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser({ ...selectedUser, role });
      }
      onRefresh();
    } catch { 
      toast.error("Role update failed"); 
    }
  };

  const handleBan = async (id: string) => {
    if (!confirm("Toggle suspension for this account?")) return;
    try {
      await adminAPI.ban(id);
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser({ ...selectedUser, isBlocked: !selectedUser.isBlocked });
      }
      onRefresh();
      toast.success("Account status updated");
    } catch { 
      toast.error("Action failed"); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this user account? This cannot be undone.")) return;
    try {
      await adminAPI.deleteUser(id);
      setSelectedUser(null);
      onRefresh();
      toast.success("Account permanently purged");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* ── Searchable SaaS Table (8 cols) ── */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Search Input Container */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search platform user records by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#07070c]/50 border border-white/[0.04] rounded-2xl py-4 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-white/[0.12] transition-all font-sans"
          />
        </div>
        
        {/* Modern SaaS Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "student", "staff", "admin", "superadmin"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-xl border text-[9.5px] font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                roleFilter === role 
                  ? "bg-white/[0.04] text-white border-white/[0.12] shadow-sm" 
                  : "bg-[#07070c]/50 text-gray-500 border-white/[0.04] hover:text-white"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Clean SaaS Table */}
        <div className="rounded-2xl border border-white/[0.04] bg-[#07070c]/30 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0b0b12] border-b border-white/[0.04] font-mono text-[9px] text-gray-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 font-black">User Identity</th>
                  <th className="px-6 py-4 font-black">Clearance Role</th>
                  <th className="px-6 py-4 font-black text-center">Status</th>
                  <th className="px-6 py-4 font-black text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map((u) => (
                  <motion.tr 
                    key={u._id}
                    layout
                    onClick={() => setSelectedUser(u)}
                    className={`hover:bg-white/[0.01] transition-all duration-200 cursor-pointer group ${
                      selectedUser?._id === u._id ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-lg bg-black border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-mono text-gray-500">{u.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate font-sans">{u.name}</p>
                          <p className="text-[9.5px] text-gray-500 font-mono truncate mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono font-bold text-gray-300 uppercase tracking-wide">
                        {u.role}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded border tracking-wide ${
                        u.isBlocked 
                          ? 'text-rose-400 border-rose-500/10 bg-rose-500/5' 
                          : 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5'
                      }`}>
                        {u.isBlocked ? "SUSPENDED" : "VERIFIED"}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <ChevronRight size={15} className="text-gray-500" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filtered.length === 0 && (
            <div className="p-16 text-center text-gray-600 font-sans text-xs">
              No matching records detected in database.
            </div>
          )}
        </div>

      </div>

      {/* ── Premium Details Sidebar (4 cols) ── */}
      <div className="lg:col-span-4">
        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div 
              key={selectedUser._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-3xl border border-white/[0.04] bg-[#07070c]/50 p-6 sticky top-24 shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Header Profile Info */}
                <div className="text-center mb-6">
                  <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1.5px] mx-auto mb-4 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                    <div className="w-full h-full rounded-[14px] bg-[#05050a] flex items-center justify-center overflow-hidden">
                      {selectedUser.avatar ? (
                        <img src={selectedUser.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-mono text-indigo-400 font-bold">{selectedUser.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{selectedUser.name}</h3>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">{selectedUser.email}</p>
                </div>

                {/* Clearance Modifiers */}
                <div className="space-y-5 pt-2 border-t border-white/[0.04]">
                  <div>
                    <h4 className="text-[8.5px] font-mono text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-bold">
                      <Award size={13} className="text-indigo-400" /> Convert Clearance Level
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['student', 'staff', 'admin', 'superadmin'].map((r) => (
                        <button 
                          key={r}
                          onClick={() => handleRoleChange(selectedUser._id, r)}
                          disabled={selectedUser.role === "superadmin" && r !== "superadmin"}
                          className={`py-2 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider border transition-all duration-200 ${
                            selectedUser.role === r 
                              ? "bg-white/[0.04] text-white border-white/[0.12] shadow-sm" 
                              : "bg-[#07070c]/50 text-gray-500 border-white/[0.04] hover:border-white/[0.08] hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="pt-4 border-t border-white/[0.04]">
                    <h4 className="text-[8.5px] font-mono text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-bold">
                      <Activity size={13} className="text-purple-400" /> Platform Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.03]">
                        <p className="text-[8px] font-mono text-gray-500 uppercase font-bold">Uploads</p>
                        <p className="text-xl font-bold text-white font-mono mt-0.5">{selectedUser.uploadCount || 0}</p>
                      </div>
                      <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.03]">
                        <p className="text-[8px] font-mono text-gray-500 uppercase font-bold">Downloads</p>
                        <p className="text-xl font-bold text-white font-mono mt-0.5">{selectedUser.downloadCount || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Modifiers */}
              <div className="pt-5 border-t border-white/[0.04] space-y-2 mt-6">
                <button 
                  onClick={() => handleBan(selectedUser._id)}
                  className={`w-full py-3 rounded-xl font-mono font-bold text-[9px] uppercase tracking-wider transition-all duration-200 border ${
                    selectedUser.isBlocked 
                      ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10" 
                      : "bg-rose-500/5 border-rose-500/10 text-rose-400 hover:bg-rose-500/10"
                  }`}
                >
                  {selectedUser.isBlocked ? "Reactivate Clearance" : "Suspend Account"}
                </button>
                {selectedUser.role !== "superadmin" && (
                  <button
                    onClick={() => handleDelete(selectedUser._id)}
                    className="w-full py-3 rounded-xl font-mono font-bold text-[9px] uppercase tracking-wider transition-all duration-200 border bg-rose-500/5 border-rose-500/10 text-rose-400 hover:bg-rose-500/10"
                  >
                    Purge Platform Data
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-white/[0.04] border-dashed bg-[#07070c]/20 p-8 text-center h-[320px] flex flex-col items-center justify-center opacity-50 sticky top-24">
              <AlertCircle size={28} className="text-gray-700 mb-3" />
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-black">Select profile to inspect clearance</p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
