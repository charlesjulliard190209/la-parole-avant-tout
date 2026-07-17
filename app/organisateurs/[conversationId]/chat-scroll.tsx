"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
  Variante Organisateur du ChatScroll côté élève (dupliqué plutôt que partagé
  entre routes, même convention que ConversationThread). Fil scrollable du
  layout de chat plein écran : colle en bas comme une app de messagerie —
  scrolle vers le bas à l'arrivée et à chaque NOUVEAU message (réponse envoyée
  ou message élève surfacé par le polling AutoRefresh). Un simple re-render
  sans nouveau message ne bouge jamais le fil, pour que la relecture d'anciens
  messages reste possible.
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
