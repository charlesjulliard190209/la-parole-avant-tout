"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
  Scrollable feed of the full-screen chat layout. Sticks to the bottom the
  way messaging apps do: scrolls down on arrival and whenever a NEW message
  shows up (messageCount increase — either the student's own send or an
  Organisateur reply surfaced by the polling). A simple re-render with no
  new message never moves the feed, so reading old messages stays possible.
*/
export function ChatScroll({
  messageCount,
  children,
}: {
  messageCount: number;
  children: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousCount = useRef(0);

  useEffect(() => {
    if (messageCount > previousCount.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
    previousCount.current = messageCount;
  }, [messageCount]);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      {children}
    </div>
  );
}
