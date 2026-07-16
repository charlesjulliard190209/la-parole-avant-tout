"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

// Hydration detection without setState-in-effect: the server snapshot is
// false, the client snapshot is true, and nothing ever notifies.
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Light/dark toggle (next-themes).
 *
 * Styled like a mobile-menu entry (same classes as the Sheet links): that is
 * its only placement today — no desktop toggle (Fab's decision, 2026-07-16),
 * where the OS preference applies.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // The resolved theme is only known on the client (localStorage + OS
  // preference): before hydration, render the default "light" state —
  // identical to the server render — to avoid a mismatch.
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--radius)] px-3 py-3 text-left text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className
      )}
    >
      {isDark ? (
        <SunIcon aria-hidden className="size-5" />
      ) : (
        <MoonIcon aria-hidden className="size-5" />
      )}
      {isDark ? "Mode clair" : "Mode sombre"}
    </button>
  );
}
