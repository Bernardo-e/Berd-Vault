"use client";

import { useEffect, useState } from "react";
import { Activity, Users } from "lucide-react";
import { engagementAPI } from "@/lib/api";
import { LIVE_USER_COUNT_EVENT, LIVE_USER_REFRESH_MS } from "@/lib/liveUsers";
import { cn } from "@/lib/utils";

type LiveUserCounterProps = {
  className?: string;
};

export default function LiveUserCounter({ className }: LiveUserCounterProps) {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    let stopped = false;

    const updateActiveUsers = (count: number) => {
      if (stopped) return;

      setActiveUsers(count);
      setIsUnavailable(false);
    };

    const fetchActiveUsers = async () => {
      try {
        const res = await engagementAPI.getActiveUsers();
        const count = Number(res.data?.activeUsers ?? 0);

        updateActiveUsers(count);
      } catch {
        if (!stopped) setIsUnavailable(true);
      }
    };

    const handleLiveUserCount = (event: Event) => {
      const activeUsers = (event as CustomEvent<{ activeUsers?: number }>).detail?.activeUsers;
      if (typeof activeUsers === "number") updateActiveUsers(activeUsers);
    };

    void fetchActiveUsers();

    const intervalId = window.setInterval(fetchActiveUsers, LIVE_USER_REFRESH_MS);
    window.addEventListener(LIVE_USER_COUNT_EVENT, handleLiveUserCount);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
      window.removeEventListener(LIVE_USER_COUNT_EVENT, handleLiveUserCount);
    };
  }, []);

  const countLabel = activeUsers === null || isUnavailable ? "--" : activeUsers.toLocaleString();
  const userLabel = activeUsers === 1 ? "user" : "users";
  const statusLabel = isUnavailable
    ? "count unavailable"
    : activeUsers === null
      ? "checking now"
      : `${userLabel} online now`;
  const ariaLabel = isUnavailable
    ? "Live user count unavailable"
    : activeUsers === null
      ? "Checking live user count"
      : `${countLabel} ${userLabel} online now`;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#00D4AA]/30 bg-[#00D4AA]/10 px-4 py-3 text-sm text-white shadow-[0_0_24px_rgba(0,212,170,0.08)]",
        className
      )}
    >
      <span className="inline-flex items-center gap-2 font-semibold text-[#00D4AA]">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D4AA] opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00D4AA]" />
        </span>
        <Activity size={15} />
        Live Now
      </span>
      <span className="inline-flex items-center gap-2 text-gray-200">
        <Users size={16} className="text-white" />
        <strong className="font-display text-lg leading-none text-white">{countLabel}</strong>
        <span>{statusLabel}</span>
      </span>
    </div>
  );
}
