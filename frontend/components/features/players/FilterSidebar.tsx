"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { FilterOption } from "@/types/api/filters";
import type { SeasonListItem } from "@/types/api/seasons";

interface FilterSidebarProps {
  positions: FilterOption[];
  seasons: SeasonListItem[];
}

export function FilterSidebar({ positions, seasons }: FilterSidebarProps) {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  
  const [isOpen, setIsOpen] = useState(false); // For mobile overlay

  // Current selections
  const currentPosition = searchParams.get("position") || "";
  const currentSeason = searchParams.get("seasonCode") || "";
  const currentMinOvr = searchParams.get("minOvr") || "";
  const currentMaxOvr = searchParams.get("maxOvr") || "";

  // Handlers
  const handleSelect = (key: string, value: string) => {
    updateParams({ [key]: value || null });
  };

  const handleOvrChange = (key: "minOvr" | "maxOvr", value: string) => {
    // Basic validation to only allow numbers or empty
    if (value === "" || /^\d+$/.test(value)) {
      updateParams({ [key]: value || null });
    }
  };

  const clearAll = () => {
    updateParams({
      position: null,
      seasonCode: null,
      minOvr: null,
      maxOvr: null,
    });
    setIsOpen(false);
  };

  const totalActive = [currentPosition, currentSeason, currentMinOvr, currentMaxOvr].filter(Boolean).length;

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[var(--card)] sm:bg-transparent">
      {/* Mobile Header */}
      <div className="sm:hidden flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 font-semibold">
          <Filter size={18} />
          Bộ lọc ({totalActive})
        </div>
        <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-0 space-y-6">
        {/* Season Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Season</h3>
          <div className="relative">
            <select
              className="w-full appearance-none bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]"
              value={currentSeason}
              onChange={(e) => handleSelect("seasonCode", e.target.value)}
            >
              <option value="">Tất cả Season</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" />
          </div>
        </div>

        {/* Position Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Vị trí</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSelect("position", "")}
              className={`py-1.5 px-2 text-xs font-medium rounded-md border transition-colors ${
                !currentPosition
                  ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--primary)]/50"
              }`}
            >
              Tất cả
            </button>
            {positions.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect("position", p.id)}
                className={`py-1.5 px-2 text-xs font-medium rounded-md border transition-colors ${
                  currentPosition === p.id
                    ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--primary)]/50"
                }`}
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* OVR Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Chỉ số OVR</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Min"
              value={currentMinOvr}
              onChange={(e) => handleOvrChange("minOvr", e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] text-center focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]"
            />
            <span className="text-[var(--foreground-muted)]">-</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Max"
              value={currentMaxOvr}
              onChange={(e) => handleOvrChange("maxOvr", e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] text-center focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="sm:hidden p-4 border-t border-[var(--border)] mt-auto bg-[var(--card)]">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={clearAll}>Xóa lọc</Button>
          <Button variant="default" className="flex-1" onClick={() => setIsOpen(false)}>Áp dụng</Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="sm:hidden mb-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <Filter size={16} />
          Bộ lọc {totalActive > 0 && <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] ml-1">{totalActive}</span>}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-[var(--card)] shadow-2xl animate-in slide-in-from-right-full">
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden sm:block w-64 shrink-0">
        <div className="sticky top-20 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-[var(--foreground)] flex items-center gap-2">
              <Filter size={16} className="text-[var(--primary)]" />
              Bộ lọc
            </h2>
            {totalActive > 0 && (
              <button 
                onClick={clearAll}
                className="text-xs text-[var(--primary)] hover:underline"
              >
                Xóa tất cả
              </button>
            )}
          </div>
          {SidebarContent}
        </div>
      </div>
    </>
  );
}
