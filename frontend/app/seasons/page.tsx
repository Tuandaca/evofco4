import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Season",
  description:
    "Khám phá tất cả các Season FC Online đang hoạt động và lịch sử phát hành.",
};

export default function SeasonsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <PageHeader
        title="Season Browser"
        description="Xem tất cả các Season FC Online đã được đồng bộ. Mỗi Season bao gồm danh sách cầu thủ và thông tin cập nhật."
        badge={
          <Badge variant="success" className="w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            Milestone 3A Foundation
          </Badge>
        }
        className="mb-8"
      />

      {/* Empty State */}
      <EmptyState
        icon={Calendar}
        title="Tính năng đang được phát triển"
        description="Trang Season Browser đầy đủ sẽ được triển khai trong Milestone 3B. API backend đã sẵn sàng tại /api/v1/seasons."
        action={
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            Về trang chủ
            <ArrowRight size={15} />
          </Link>
        }
      />

      {/* API Readiness Info */}
      <div className="mt-8 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">
          API Integration Ready
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {[
            "GET /api/v1/seasons",
            "GET /api/v1/seasons/{id}",
            "GET /api/v1/seasons/{id}/players",
          ].map((endpoint) => (
            <div
              key={endpoint}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)]"
            >
              <span className="text-[var(--success)]">✓</span>
              <code className="text-[var(--primary)]">{endpoint}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
