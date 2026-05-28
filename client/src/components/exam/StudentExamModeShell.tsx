"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ExamModeOverlay } from "@/components/exam/ExamModeOverlay";
import { useAuthStore, useThemeStore } from "@/lib/store";

const FocusTimer = dynamic(() => import("@/components/ui/FocusTimer"), { ssr: false });

export default function StudentExamModeShell() {
  const { user, isAuthenticated } = useAuthStore();
  const { examMode } = useThemeStore();
  const pathname = usePathname();
  const isStudent = isAuthenticated && user?.role === "student";
  const isBrowsePage = pathname === "/browse";

  useEffect(() => {
    document.body.classList.toggle("exam-mode", Boolean(isStudent && examMode && isBrowsePage));

    return () => {
      document.body.classList.remove("exam-mode");
    };
  }, [examMode, isStudent, isBrowsePage]);

  if (!isStudent || !isBrowsePage) return null;

  return (
    <>
      <ExamModeOverlay />
      <FocusTimer />
    </>
  );
}
