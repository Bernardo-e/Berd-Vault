"use client";

import { Award, Download, FileText, Heart, Megaphone, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: any;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      label: "Total Uploads",
      value: stats?.totalUploads || 0,
      detail: "Official PDFs and materials",
      icon: FileText,
      tone: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Student Interactions",
      value: stats?.totalStudentInteractions || 0,
      detail: "Views, downloads, upvotes, appreciation",
      icon: MousePointerClick,
      tone: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Engagement Score",
      value: `${stats?.engagementScore || 0}%`,
      detail: "Weighted activity signal",
      icon: Award,
      tone: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "Total Downloads",
      value: stats?.totalDownloads || 0,
      detail: "Across your uploads",
      icon: Download,
      tone: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Announcements Posted",
      value: stats?.announcementsPosted || 0,
      detail: "Updates visible to students",
      icon: Megaphone,
      tone: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Most Appreciated Material",
      value: stats?.mostAppreciatedPdf?.title || "No data yet",
      detail: `${stats?.mostAppreciatedPdf?.upvoteCount || 0} appreciations`,
      icon: Award,
      tone: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      compact: true,
    },
    {
      label: "Total Appreciation",
      value: (stats?.totalUpvotes || 0) + (stats?.announcementAppreciations || 0),
      detail: "Upload upvotes plus notice appreciation",
      icon: Heart,
      tone: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <section
            key={item.label}
            className="glass-card p-5 border-white/10 bg-black/20 hover:translate-y-[-2px] transition-transform"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {item.label}
                </p>
                <p className={cn("mt-2 font-display font-black text-white", item.compact ? "text-lg truncate" : "text-3xl")}>
                  {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{item.detail}</p>
              </div>
              <div className={cn("shrink-0 rounded-xl border p-3", item.tone)}>
                <Icon size={20} />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
