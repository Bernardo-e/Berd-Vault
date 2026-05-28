"use client";
import { useEffect } from "react";

export default function ThemeBootstrap() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  return null;
}
