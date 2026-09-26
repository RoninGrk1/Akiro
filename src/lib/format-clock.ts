/**
 * Deterministic clock formatting for SSR/client hydration safety.
 * Always formats as UTC HH:MM:SS so server and browser match.
 */
export function formatClock(iso: string): string {
  // Prefer slicing a well-formed ISO string: 2026-01-01T12:34:56.000Z
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/.exec(iso);
  if (match) return match[2];

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--:--";
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

/** Fixed epoch used for module-scope / initial UI stamps (hydration-safe). */
export const FIXED_BOOT_ISO = "2026-01-01T00:00:00.000Z";

/** Runtime stamp after hydration / user action — safe to call from event handlers. */
export function nowIso(): string {
  return new Date().toISOString();
}
