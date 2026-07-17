"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/*
  Organisateur-side counterpart of the student's AutoRefresh (duplicated
  rather than shared across routes, same convention as ConversationThread):
  polls for the student's new messages while an Organisateur has the
  conversation open, so replies feel like a live chat. The thread is
  rendered server-side, so a router.refresh() re-fetches messages (and, as a
  side effect, re-runs marquerLu — harmless, it just keeps the conversation
  marked read while it is being watched). Polling pauses while the tab is
  hidden and fires immediately on return.
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
