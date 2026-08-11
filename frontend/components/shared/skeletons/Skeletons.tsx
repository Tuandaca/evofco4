import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--muted)]",
        className
      )}
      aria-hidden="true"
    />
  );
}

// ── Table Skeleton ────────────────────────────────────────────

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 8,
  columns = 5,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-[var(--border)] overflow-hidden", className)} aria-label="Loading table" aria-busy="true">
      {/* Header */}
      <div className="grid gap-4 px-4 py-3 bg-[var(--muted)]/30 border-b border-[var(--border)]"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="grid gap-4 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Card Skeleton ─────────────────────────────────────────────

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3",
        className
      )}
      aria-label="Loading card"
      aria-busy="true"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

// ── Page Skeleton ─────────────────────────────────────────────

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("space-y-6", className)}
      aria-label="Loading page"
      aria-busy="true"
    >
      {/* Page header */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      {/* Content area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Player Card Skeleton ──────────────────────────────────────

export function PlayerCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4",
        className
      )}
      aria-label="Loading player card"
      aria-busy="true"
    >
      <div className="flex justify-between items-start">
        <Skeleton className="w-16 h-16 rounded-lg" />
        <Skeleton className="w-10 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-2 w-2/3 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { Skeleton };
