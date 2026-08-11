import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
      role="status"
      aria-label={title}
    >
      {Icon && (
        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--muted)]">
          <Icon
            size={32}
            className="text-[var(--foreground-muted)]"
            aria-hidden="true"
          />
        </div>
      )}
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-[var(--foreground-muted)] max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
