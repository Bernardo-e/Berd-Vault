import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nv_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("nv_token");
      localStorage.removeItem("nv_user");
      // Only redirect if not already on auth page
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login:    (data: any) => api.post("/auth/login", data),
  me:       ()          => api.get("/auth/me"),
};

// ─── Notes ────────────────────────────────────────────────────────────────────
export const notesAPI = {
  getAll:    (params?: any) => api.get("/notes", { params }),
  getTrending: ()           => api.get("/notes/trending"),
  getRecent:   ()           => api.get("/notes/recent"),
  getOne:    (id: string)   => api.get(`/notes/${id}`),
  upload:    (data: FormData) => api.post("/notes", data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete:    (id: string)   => api.delete(`/notes/${id}`),
  rate:      (id: string, score: number) => api.post(`/notes/${id}/rate`, { score }),
  comment:   (id: string, text: string) => api.post(`/notes/${id}/comment`, { text }),
  download:  (id: string)   => api.post(`/notes/${id}/download`),
  adminAll:  ()             => api.get("/notes/admin/all"),
  approve:   (id: string, isApproved: boolean) => api.put(`/notes/${id}/approve`, { isApproved }),
  adminUpdate: (id: string, data: any) => api.put(`/notes/admin/${id}`, data),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile:    (id: string) => api.get(`/users/${id}`),
  getBookmarks:  () => api.get("/users/me/bookmarks"),
  updateProfile: (data: any)  => api.put("/users/me", data),
  toggleBookmark: (noteId: string) => api.post(`/users/bookmark/${noteId}`),
  getNotifications: ()        => api.get("/users/me/notifications"),
  adminAll:      ()           => api.get("/users/admin/all"),
  adminBlock:    (id: string)   => api.put(`/users/admin/${id}/block`),
  adminDelete:   (id: string)   => api.delete(`/users/admin/${id}`),
};

// ─── Admin Management ────────────────────────────────────────────────────────
export const adminAPI = {
  getRequests: () => api.get("/admin/requests"),
  getPendingRequests: () => api.get("/admin/requests"),
  getList:     () => api.get("/admin/list"),
  approve:     (id: string) => api.post(`/admin/approve/${id}`),
  reject:      (id: string) => api.post(`/admin/reject/${id}`),
  remove:      (id: string) => api.delete(`/admin/remove/${id}`),
  getStats:    () => api.get("/admin/analytics"),
  getActivityLogs: () => api.get("/admin/activity"),
  getUsers:    () => api.get("/admin/users"),
  changeRole:  (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  updateRole:  (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  ban:         (id: string) => api.put(`/admin/users/${id}/ban`),
  banUser:     (id: string) => api.put(`/admin/users/${id}/ban`),
  deleteUser:  (id: string) => api.delete(`/admin/users/${id}`),
  warnUser:    (id: string, message: string) => api.post(`/admin/users/${id}/warn`, { message }),
  getNotes:    () => api.get("/admin/notes"),
  moderateNote: (id: string, data: any) => api.put(`/admin/notes/${id}/moderate`, data),
  deleteNote:  (id: string) => api.delete(`/admin/notes/${id}`),
  tagNote:     (id: string, priority: string) => api.put(`/admin/notes/${id}/tag`, { priority }),
  getReports:  () => api.get("/admin/reports"),
  updateReport: (id: string, status: string) => api.put(`/admin/reports/${id}/status`, { status }),
  deleteReport: (id: string) => api.delete(`/admin/reports/${id}`),
  getAnnouncements: () => api.get("/admin/announcements"),
  updateAnnouncement: (id: string, data: any) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),
  getControls: () => api.get("/admin/controls"),
  updateControls: (data: any) => api.put("/admin/controls", data),
};

// ─── Staff ────────────────────────────────────────────────────────────────────
export const staffAPI = {
  getStats:          () => api.get("/staff/stats"),
  getNotes:          () => api.get("/staff/notes"),
  uploadNote:        (data: FormData) => api.post("/staff/notes", data, { headers: { "Content-Type": "multipart/form-data" } }),
  updateNote:        (id: string, data: any) => api.put(`/staff/notes/${id}`, data),
  deleteNote:        (id: string) => api.delete(`/staff/notes/${id}`),
  getAnnouncements:  () => api.get("/staff/announcements"),
  getMyAnnouncements: () => api.get("/staff/my-announcements"),
  postAnnouncement:  (data: any) => api.post("/staff/announcements", data),
  updateAnnouncement: (id: string, data: any) => api.put(`/staff/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete(`/staff/announcements/${id}`),
  appreciateAnnouncement: (id: string) => api.post(`/staff/announcements/${id}/appreciate`),
  getProfile:        () => api.get("/staff/profile"),
  updateProfile:     (data: any) => api.put("/staff/profile", data),
};

// ─── Moderator ────────────────────────────────────────────────────────────────
export const moderatorAPI = {
  getStats:      () => api.get("/moderator/stats"),
  getNotes:      () => api.get("/moderator/notes"),
  updateNote:    (id: string, data: any) => api.put(`/moderator/notes/${id}`, data),
  deleteNote:    (id: string) => api.delete(`/moderator/notes/${id}`),
  tagNote:       (id: string, priority: string) => api.put(`/moderator/notes/${id}/tag`, { priority }),
  getReports:    () => api.get("/moderator/reports"),
  submitReport:  (data: any) => api.post("/moderator/reports", data),
  updateReport:  (id: string, status: string) => api.put(`/moderator/reports/${id}/status`, { status }),
  deleteReport:  (id: string) => api.delete(`/moderator/reports/${id}`),
  getUsers:      () => api.get("/moderator/users"),
  suspendUser:   (id: string) => api.put(`/moderator/users/${id}/suspend`),
  warnUser:      (id: string, message: string) => api.post(`/moderator/users/${id}/warn`, { message }),
};

// ─── Engagement ───────────────────────────────────────────────────────────────
export const engagementAPI = {
  heartbeat:      (clientId: string) => api.post("/engagement/active-users/heartbeat", { clientId }),
  getActiveUsers: () => api.get("/engagement/active-users"),
  leave:          (clientId: string) => api.post("/engagement/active-users/leave", { clientId }),
  upvote:         (id: string) => api.post(`/engagement/upvote/${id}`),
  getLeaderboard: () => api.get("/engagement/leaderboard"),
  awardBadges:    () => api.post("/engagement/award-badges"),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getApiUrl = (path?: string) => path ? `${API_URL}${path}` : API_URL;
export const getActiveUserStreamUrl = (clientId: string) =>
  `${API_URL}/engagement/active-users/live-stream?clientId=${encodeURIComponent(clientId)}`;
