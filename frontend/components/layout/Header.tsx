"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Zap,
  Users,
  Calendar,
  TrendingUp,
  BarChart3,
  Target,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/players", label: "Cầu thủ", icon: Users },
  { href: "/seasons", label: "Season", icon: Calendar },
  { href: "/upgrade", label: "Nâng cấp", icon: TrendingUp },
  { href: "/bait", label: "Dây mồi", icon: Target },
  { href: "/prediction", label: "Dự đoán", icon: Zap },
  { href: "/statistics", label: "Thống kê", icon: BarChart3 },
] as const;

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "relative inline-flex items-center justify-center w-9 h-9 rounded-lg",
        "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
        "hover:bg-[var(--muted)] transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
      )}
      aria-label="Toggle theme"
    >
      <Sun
        size={18}
        className="rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0"
      />
      <Moon
        size={18}
        className="absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
      />
    </button>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="FC Upgrade Intelligence - Home"
          >
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg",
                "bg-[var(--primary)] text-[var(--primary-foreground)]",
                "group-hover:scale-105 transition-transform duration-200"
              )}
            >
              <Zap size={18} strokeWidth={2.5} />
            </div>
            <span className="hidden sm:block font-bold text-[var(--foreground)] tracking-tight leading-none">
              FC{" "}
              <span className="text-[var(--primary)]">Upgrade</span>{" "}
              <span className="text-[var(--foreground-muted)] font-medium text-sm">
                Intelligence
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              className={cn(
                "md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg",
                "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                "hover:bg-[var(--muted)] transition-colors duration-200"
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-t border-[var(--border)] bg-[var(--background)]"
        >
          <nav
            className="px-4 py-3 flex flex-col gap-1"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                  )}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
