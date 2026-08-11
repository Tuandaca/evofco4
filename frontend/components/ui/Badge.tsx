import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20",
        secondary:
          "bg-[var(--muted)] text-[var(--foreground-muted)] border border-[var(--border)]",
        destructive:
          "bg-[var(--destructive)]/15 text-[var(--destructive)] border border-[var(--destructive)]/20",
        success:
          "bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/20",
        accent:
          "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20",
        outline:
          "border border-[var(--border)] text-[var(--foreground-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
