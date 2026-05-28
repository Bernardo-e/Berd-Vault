import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  college: string;
  department: string;
  designation?: string;
  subjectsHandled?: string[];
  year: string;
  role: "student" | "staff" | "admin" | "superadmin";
  adminStatus?: "none" | "pending" | "approved" | "rejected";
  uploadCount: number;
  downloadCount?: number;
  bookmarks: string[];
  notifications?: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("nv_token", token);
          localStorage.setItem("nv_user", JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("nv_token");
          localStorage.removeItem("nv_user");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name: "nv_auth",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ─── Theme Store ──────────────────────────────────────────────────────────────
interface ThemeStore {
  theme: "dark";
  examMode: boolean;
  toggleExamMode: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "dark",
      examMode: false,
      toggleExamMode: () =>
        set((state) => {
          const next = !state.examMode;
          if (typeof document !== "undefined") {
            document.body.classList.toggle("exam-mode", next);
            if (next && "vibrate" in navigator) {
                navigator.vibrate([100, 50, 100]); // subtle vibration pattern
            }
          }
          return { examMode: next };
        }),
    }),
    {
      name: "nv_theme",
      partialize: (state) => ({ examMode: state.examMode }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ThemeStore>),
        theme: "dark",
      }),
    }
  )
);

// ─── constants ────────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  "Computer Science", "Information Technology", "Electronics & Communication",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "Chemical Engineering", "Aerospace Engineering", "Biotechnology", "Other"
];

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
export const SEMESTERS = [
  "Semester 1","Semester 2","Semester 3","Semester 4",
  "Semester 5","Semester 6","Semester 7","Semester 8"
];

export const FILE_ICONS: Record<string, string> = {
  pdf: "📄", doc: "📝", docx: "📝", ppt: "📊", pptx: "📊"
};
