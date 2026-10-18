import React, { useEffect, useState } from "react";
import { checkBackendHealth } from "../../services/api";
import { Loader2 } from "lucide-react";

/**
 * ServerKeepAlive Component
 * 1. Pings /api/health immediately on mount to wake up the Render free-tier container & Supabase DB.
 * 2. Periodically pings /api/health every 60 seconds to prevent inactivity sleep while the tab is open.
 * 3. Shows a subtle non-intrusive indicator if the server is in a cold-start boot phase.
 */
export const ServerKeepAlive: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "waking" | "online" | "offline">("idle");

  const pingServer = async (isInitial = false) => {
    try {
      if (isInitial && status === "idle") {
        // If initial ping takes longer than 2s, mark as waking
        const timer = setTimeout(() => {
          setStatus((prev) => (prev === "idle" ? "waking" : prev));
        }, 2000);

        await checkBackendHealth();
        clearTimeout(timer);
        setStatus("online");
        // Automatically hide "online" indicator after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        await checkBackendHealth();
        if (status === "waking" || status === "offline") {
          setStatus("online");
          setTimeout(() => setStatus("idle"), 3000);
        }
      }
    } catch {
      // Server might still be booting up
      if (isInitial) {
        setStatus("waking");
      }
    }
  };

  useEffect(() => {
    // Initial warmup ping
    pingServer(true);

    // Periodic keep-alive ping every 60 seconds
    const interval = setInterval(() => {
      pingServer(false);
    }, 60000);

    // Wake up when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pingServer(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (status === "idle") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300">
      {status === "waking" && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#14171A] text-white shadow-xl text-xs font-medium border border-white/10 backdrop-blur-md animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E29578]" />
          <span>Waking up cloud server (Render free tier)...</span>
        </div>
      )}
      {status === "online" && (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-950/90 text-emerald-200 shadow-lg text-xs font-medium border border-emerald-500/20 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Cloud server connected</span>
        </div>
      )}
    </div>
  );
};
