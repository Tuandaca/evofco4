"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PlayerViewToggleProps {
  viewMode: "grid" | "compact";
  onChange: (mode: "grid" | "compact") => void;
}

export function PlayerViewToggle({ viewMode, onChange }: PlayerViewToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-20 h-9" />; // Placeholder
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg border border-[var(--border)] bg-[var(--card)] hidden sm:flex">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        className="h-7 w-8 p-0 rounded-md"
        onClick={() => onChange("grid")}
        aria-label="Dạng lưới"
        title="Dạng lưới"
      >
        <LayoutGrid size={14} />
      </Button>
      <Button
        variant={viewMode === "compact" ? "default" : "ghost"}
        size="sm"
        className="h-7 w-8 p-0 rounded-md"
        onClick={() => onChange("compact")}
        aria-label="Dạng danh sách"
        title="Dạng danh sách"
      >
        <List size={14} />
      </Button>
    </div>
  );
}
