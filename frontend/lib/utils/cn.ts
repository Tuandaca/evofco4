import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind CSS class names.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a large number as a Korean-style currency string.
 * e.g., 1500000 → "150만" or "150만 BP"
 */
export function formatKrPrice(price: number, suffix = "BP"): string {
  if (price === 0) return "—";
  const man = price / 10_000;
  if (man >= 1) {
    return `${man.toLocaleString("ko-KR")}만 ${suffix}`.trim();
  }
  return `${price.toLocaleString("ko-KR")} ${suffix}`.trim();
}

/**
 * Format a date string as a localized date.
 */
export function formatDate(dateString: string, locale = "vi-VN"): string {
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format a date string as a relative time (e.g., "3 days ago").
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

/**
 * Get OVR color class based on rating value.
 * Used for displaying player OVR with consistent color coding.
 */
export function getOvrColorClass(ovr: number): string {
  if (ovr >= 99) return "text-amber-400";
  if (ovr >= 95) return "text-purple-400";
  if (ovr >= 90) return "text-blue-400";
  if (ovr >= 85) return "text-green-400";
  if (ovr >= 80) return "text-emerald-400";
  return "text-slate-400";
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}
