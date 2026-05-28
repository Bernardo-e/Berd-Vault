import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ThemeBootstrap from "@/components/ThemeBootstrap";

const inter  = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Berd Vault — Share Knowledge. Ace Everything.", template: "%s | Berd Vault" },
  description: "The premier platform for engineering students to upload, discover, and download study notes. Browse by college, department, year, and subject.",
  keywords: ["engineering notes", "study materials", "college notes", "student notes", "Berd Vault"],
  authors: [{ name: "Berd" }],
  openGraph: {
    title: "Berd Vault — Share Knowledge. Ace Everything.",
    description: "Engineering study notes platform built for students.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`} suppressHydrationWarning>
        <ThemeBootstrap />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              fontFamily: "Inter, sans-serif",
            },
            success: { iconTheme: { primary: "#00D4AA", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
