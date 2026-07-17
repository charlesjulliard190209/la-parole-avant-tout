"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/*
  Polls for Organisateur replies while the student is on the conversation:
  the thread is rendered server-side, so a router.refresh() re-fetches the
  messages without touching client state (the message being typed in the
  form survives the refresh). Polling pauses while the tab is hidden and
  fires immediately when the student comes back to it.
*/
const REFRESH_INTERVAL_MS = 5000;

export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refreshSiVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const intervalId = setInterval(refreshSiVisible, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshSiVisible);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshSiVisible);
    };
  }, [router]);

  return null;
}
