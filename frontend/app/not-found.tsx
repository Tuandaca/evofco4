import Link from "next/link";
import type { Metadata } from "next";
import { Home, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Không tìm thấy trang",
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* 404 Number */}
      <div
        className="text-[10rem] font-extrabold leading-none mb-4 select-none"
        style={{
          background:
            "linear-gradient(135deg, hsl(213,94%,60%), hsl(230,80%,70%))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          opacity: 0.2,
        }}
        aria-hidden="true"
      >
        404
      </div>

      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
        Trang không tồn tại
      </h1>

      <p className="text-[var(--foreground-muted)] max-w-sm leading-relaxed mb-8">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy
        kiểm tra lại URL hoặc quay về trang chủ.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          <Home size={16} />
          Về trang chủ
        </Link>
        <Link
          href="/players"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--card-hover)] transition-colors"
        >
          <Search size={16} />
          Tìm kiếm cầu thủ
        </Link>
      </div>
    </div>
  );
}
