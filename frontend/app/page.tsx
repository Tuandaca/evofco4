import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Calendar,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
  Database,
  Activity,
} from "lucide-react";
import { getDataStatus } from "@/lib/api/system";
import { ApiClientError } from "@/lib/api/client";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatRelativeTime } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "FC Upgrade Intelligence",
  description:
    "Nền tảng phân tích dữ liệu cầu thủ FC Online. Tối ưu hóa chiến lược nâng cấp, phân tích bait/dây mồi, dự đoán cầu thủ với AI.",
};

const FEATURES = [
  {
    href: "/players",
    icon: Users,
    title: "Cơ sở dữ liệu cầu thủ",
    description:
      "Tra cứu toàn bộ cầu thủ FC Online với thống kê chi tiết theo từng Season.",
    badge: "Available",
    badgeVariant: "success" as const,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    href: "/seasons",
    icon: Calendar,
    title: "Season Browser",
    description:
      "Khám phá tất cả các Season đang hoạt động và lịch sử phát hành.",
    badge: "Available",
    badgeVariant: "success" as const,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    href: "/upgrade",
    icon: TrendingUp,
    title: "Mô phỏng nâng cấp",
    description:
      "Tính toán xác suất và chi phí nâng cấp cầu thủ theo từng mức OVR.",
    badge: "Coming Soon",
    badgeVariant: "secondary" as const,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    href: "/bait",
    icon: Target,
    title: "Phân tích dây mồi",
    description:
      "Nhận diện các cầu thủ Bait tiềm năng dựa trên dữ liệu lịch sử Season.",
    badge: "Coming Soon",
    badgeVariant: "secondary" as const,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    href: "/prediction",
    icon: Zap,
    title: "Dự đoán AI",
    description:
      "Sử dụng AI để dự đoán Season tiếp theo và tối ưu hóa đội hình.",
    badge: "Coming Soon",
    badgeVariant: "secondary" as const,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
  {
    href: "/statistics",
    icon: BarChart3,
    title: "Thống kê",
    description: "Phân tích tổng quan thị trường cầu thủ và xu hướng meta.",
    badge: "Coming Soon",
    badgeVariant: "secondary" as const,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
] as const;

// Server component — fetch data status from API
async function DataStatusWidget() {
  let status: Awaited<ReturnType<typeof getDataStatus>> | null = null;
  let error: string | null = null;

  try {
    status = await getDataStatus();
  } catch (err) {
    if (err instanceof ApiClientError) {
      if (err.isNetworkError) {
        error = "backend-offline";
      } else {
        error = "api-error";
      }
    } else {
      error = "unknown";
    }
  }

  if (error === "backend-offline") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/20">
        <div className="w-2 h-2 rounded-full bg-[var(--destructive)] animate-pulse" />
        <span className="text-xs text-[var(--destructive)]">
          Backend offline — Khởi động server .NET để sử dụng
        </span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <div className="w-2 h-2 rounded-full bg-[var(--foreground-muted)]" />
        <span className="text-xs text-[var(--foreground-muted)]">
          Trạng thái hệ thống không khả dụng
        </span>
      </div>
    );
  }

  const hasData = status.playerCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${hasData ? "bg-[var(--success)]" : "bg-[var(--accent)]"} animate-pulse`}
        />
        <span className="text-xs text-[var(--foreground-muted)]">
          {hasData ? "Hệ thống hoạt động" : "Đang thiết lập dữ liệu"}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
        <span className="flex items-center gap-1">
          <Users size={12} className="text-[var(--primary)]" />
          <strong className="text-[var(--foreground)]">
            {(status.playerCount ?? 0).toLocaleString("vi-VN")}
          </strong>{" "}
          cầu thủ
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} className="text-[var(--primary)]" />
          <strong className="text-[var(--foreground)]">
            {(status.seasonCount ?? 0).toLocaleString("vi-VN")}
          </strong>{" "}
          season
        </span>
        {status.lastUpdatedAt && (
          <span className="flex items-center gap-1">
            <Activity size={12} className="text-[var(--success)]" />
            Cập nhật {formatRelativeTime(status.lastUpdatedAt)}
          </span>
        )}
      </div>
    </div>
  );
}

export default async function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-medium mb-6">
              <Zap size={13} />
              Phân tích dữ liệu FC Online
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] mb-6 leading-tight">
              FC{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, hsl(213,94%,60%), hsl(230,80%,70%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Upgrade
              </span>{" "}
              Intelligence
            </h1>

            <p className="text-lg text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-2xl mx-auto">
              Nền tảng phân tích dữ liệu cầu thủ FC Online chuyên sâu. Tối ưu
              hóa chiến lược nâng cấp, nhận diện bait, và dự đoán Season tiếp
              theo với AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Link
                href="/players"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-sm hover:bg-[var(--primary-hover)] transition-colors duration-200 shadow-lg shadow-[var(--primary)]/20"
              >
                <Users size={18} />
                Xem cầu thủ
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/seasons"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-semibold text-sm hover:bg-[var(--card-hover)] transition-colors duration-200"
              >
                <Calendar size={18} />
                Browser Season
              </Link>
            </div>

            {/* System Status */}
            <div className="inline-flex">
              <DataStatusWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--background-subtle)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: Database, label: "Đồng bộ từ FIFAaddict", value: "Real-time" },
              { icon: Activity, label: "API endpoints", value: "RESTful" },
              { icon: Zap, label: "Kiến trúc", value: ".NET 10 + Next.js" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--muted)]">
                  <Icon size={18} className="text-[var(--primary)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--foreground)]">
                    {value}
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3">
            Công cụ phân tích
          </h2>
          <p className="text-[var(--foreground-muted)] max-w-xl mx-auto">
            Bộ công cụ toàn diện cho FC Online — từ tra cứu cầu thủ đến dự
            đoán nâng cấp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(
            ({ href, icon: Icon, title, description, badge, badgeVariant, color, bg }) => (
              <Link
                key={href}
                href={href}
                className="group relative flex flex-col p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:border-[var(--primary)]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--primary)]/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg ${bg}`}
                  >
                    <Icon size={22} className={color} />
                  </div>
                  <Badge variant={badgeVariant}>{badge}</Badge>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed flex-1">
                  {description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs text-[var(--primary)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Khám phá
                  <ArrowRight size={13} />
                </div>
              </Link>
            )
          )}
        </div>
      </section>

      {/* ── Architecture Note ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="bg-[var(--background-subtle)]">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex-shrink-0">
                <Database size={20} className="text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">
                  Kiến trúc dữ liệu
                </h3>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                  Dữ liệu cầu thủ được đồng bộ từ{" "}
                  <strong className="text-[var(--foreground)]">FIFAaddict</strong>{" "}
                  thông qua API provider vào database{" "}
                  <strong className="text-[var(--foreground)]">PostgreSQL</strong>.
                  Frontend giao tiếp với backend{" "}
                  <strong className="text-[var(--foreground)]">.NET 10</strong>{" "}
                  qua REST API <code className="text-[var(--primary)]">/api/v1/</code>.
                  Không có kết nối trực tiếp giữa browser và database.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
