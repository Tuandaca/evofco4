"use client";

import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  title?: string;
  description?: string;
  variant?: "default" | "network" | "notFound" | "server";
  onRetry?: () => void;
  className?: string;
}

const VARIANT_CONFIG = {
  default: {
    icon: AlertTriangle,
    title: "Đã xảy ra lỗi",
    description: "Có lỗi không mong muốn xảy ra. Vui lòng thử lại.",
  },
  network: {
    icon: WifiOff,
    title: "Không thể kết nối",
    description:
      "Không thể kết nối đến máy chủ. Kiểm tra backend đang chạy tại cổng 5000.",
  },
  notFound: {
    icon: AlertTriangle,
    title: "Không tìm thấy",
    description: "Tài nguyên yêu cầu không tồn tại.",
  },
  server: {
    icon: AlertTriangle,
    title: "Lỗi máy chủ",
    description: "Máy chủ gặp sự cố. Vui lòng thử lại sau ít phút.",
  },
} as const;

export function ErrorState({
  title,
  description,
  variant = "default",
  onRetry,
  className,
}: ErrorStateProps) {
  const cfg = VARIANT_CONFIG[variant];
  const Icon = cfg.icon;
  const displayTitle = title ?? cfg.title;
  const displayDescription = description ?? cfg.description;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
      role="alert"
    >
      <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--destructive)]/10">
        <Icon
          size={32}
          className="text-[var(--destructive)]"
          aria-hidden="true"
        />
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
        {displayTitle}
      </h2>
      <p className="text-sm text-[var(--foreground-muted)] max-w-sm leading-relaxed mb-6">
        {displayDescription}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
            "bg-[var(--primary)] text-[var(--primary-foreground)]",
            "hover:bg-[var(--primary-hover)] transition-colors duration-200"
          )}
        >
          <RefreshCw size={15} />
          Thử lại
        </button>
      )}
    </div>
  );
}
