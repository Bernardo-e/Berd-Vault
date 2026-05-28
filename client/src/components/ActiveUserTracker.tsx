"use client";

import { useEffect } from "react";
import { engagementAPI, getActiveUserStreamUrl, getApiUrl } from "@/lib/api";
import {
  getLiveUserClientId,
  LIVE_USER_COUNT_EVENT,
  LIVE_USER_HEARTBEAT_MS,
} from "@/lib/liveUsers";

export default function ActiveUserTracker() {
  useEffect(() => {
    const clientId = getLiveUserClientId();
    let stopped = false;
    let fallbackIntervalId: number | undefined;
    let liveStream: EventSource | undefined;

    const publishCount = (activeUsers: number) => {
      window.dispatchEvent(
        new CustomEvent(LIVE_USER_COUNT_EVENT, {
          detail: { activeUsers },
        })
      );
    };

    const heartbeat = async () => {
      if (stopped || !clientId) return;

      try {
        const res = await engagementAPI.heartbeat(clientId);
        publishCount(Number(res.data?.activeUsers ?? 0));
      } catch {
        // The visible counter handles the offline state; tracking can fail quietly.
      }
    };

    const stopHeartbeatFallback = () => {
      if (fallbackIntervalId) {
        window.clearInterval(fallbackIntervalId);
        fallbackIntervalId = undefined;
      }
    };

    const startHeartbeatFallback = () => {
      if (fallbackIntervalId) return;

      void heartbeat();
      fallbackIntervalId = window.setInterval(heartbeat, LIVE_USER_HEARTBEAT_MS);
    };

    const leave = () => {
      if (!clientId) return;

      const url = `${getApiUrl("/engagement/active-users/leave")}?clientId=${encodeURIComponent(clientId)}`;

      if (navigator.sendBeacon) {
        navigator.sendBeacon(url);
        return;
      }

      void fetch(url, { method: "POST", keepalive: true }).catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void heartbeat();
      }
    };

    if (typeof EventSource !== "undefined") {
      liveStream = new EventSource(getActiveUserStreamUrl(clientId));
      liveStream.onopen = stopHeartbeatFallback;
      liveStream.onerror = startHeartbeatFallback;
      liveStream.addEventListener("active-users", (event: MessageEvent<string>) => {
        try {
          const data = JSON.parse(event.data) as { activeUsers?: number };
          publishCount(Number(data.activeUsers ?? 0));
          stopHeartbeatFallback();
        } catch {
          startHeartbeatFallback();
        }
      });
    } else {
      startHeartbeatFallback();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", leave);

    return () => {
      stopped = true;
      stopHeartbeatFallback();
      liveStream?.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, []);

  return null;
}
