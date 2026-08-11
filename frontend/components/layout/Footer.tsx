import Link from "next/link";
import { Zap, ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--background-subtle)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Zap size={14} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-[var(--foreground)]">
              FC Upgrade Intelligence
            </span>
          </div>

          {/* Links */}
          <nav
            className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]"
            aria-label="Footer navigation"
          >
            <Link
              href="/players"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Cầu thủ
            </Link>
            <Link
              href="/seasons"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Season
            </Link>
            <Link
              href="/upgrade"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Nâng cấp
            </Link>
          </nav>

          {/* Copyright + Data Source Note */}
          <div className="flex flex-col items-center md:items-end gap-1 text-xs text-[var(--foreground-muted)]">
            <span>© {currentYear} FC Upgrade Intelligence</span>
            <span className="flex items-center gap-1">
              Dữ liệu từ{" "}
              <a
                href="https://fifaaddict.net"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[var(--primary)] hover:underline"
              >
                FIFAaddict
                <ExternalLink size={11} />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
