"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  const isNetworkError =
    error instanceof ApiClientError && error.isNetworkError;
  const isServerError =
    error instanceof ApiClientError && error.isServerError;

  let title = "Đã xảy ra lỗi không mong muốn";
  let description =
    "Ứng dụng gặp sự cố. Thử tải lại trang hoặc liên hệ hỗ trợ.";

  if (isNetworkError) {
    title = "Không thể kết nối đến máy chủ";
    description =
      "Kiểm tra rằng backend .NET đang chạy tại http://localhost:5000 và thử lại.";
  } else if (isServerError) {
    title = "Lỗi máy chủ";
    description = "Máy chủ gặp sự cố. Vui lòng thử lại sau ít phút.";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--destructive)]/10">
        <AlertTriangle
          size={40}
          className="text-[var(--destructive)]"
          aria-hidden="true"
        />
      </div>

      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
        {title}
      </h1>

      <p className="text-[var(--foreground-muted)] max-w-md leading-relaxed mb-8">
        {description}
      </p>

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
      >
        <RefreshCw size={16} />
        Thử lại
      </button>
    </div>
  );
}
