"use client";

import { useSearchParams } from "next/navigation";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { X } from "lucide-react";
import type { SeasonListItem } from "@/types/api/seasons";

interface ActiveFiltersProps {
  seasons: SeasonListItem[];
}

export function ActiveFilters({ seasons }: ActiveFiltersProps) {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();

  const currentSearch = searchParams.get("search");
  const currentPosition = searchParams.get("position");
  const currentSeason = searchParams.get("seasonCode");
  const currentMinOvr = searchParams.get("minOvr");
  const currentMaxOvr = searchParams.get("maxOvr");

  const hasAnyFilter = Boolean(currentSearch || currentPosition || currentSeason || currentMinOvr || currentMaxOvr);

  if (!hasAnyFilter) return null;

  const removeFilter = (key: string) => {
    updateParams({ [key]: null });
  };

  const clearAll = () => {
    updateParams({
      search: null,
      position: null,
      seasonCode: null,
      minOvr: null,
      maxOvr: null,
    });
  };

  const getSeasonName = (code: string) => {
    const season = seasons.find((s) => s.code === code);
    return season ? season.name : code;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-lg border border-[var(--border)] bg-[var(--background-subtle)]">
      <span className="text-xs font-semibold text-[var(--foreground-muted)] mr-2">
        Đang lọc:
      </span>

      {currentSearch && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium border border-[var(--primary)]/20">
          Từ khóa: &quot;{currentSearch}&quot;
          <button onClick={() => removeFilter("search")} className="hover:text-[var(--foreground)] ml-1">
            <X size={12} />
          </button>
        </span>
      )}

      {currentSeason && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium border border-[var(--accent)]/20">
          Season: {getSeasonName(currentSeason)}
          <button onClick={() => removeFilter("seasonCode")} className="hover:text-[var(--foreground)] ml-1">
            <X size={12} />
          </button>
        </span>
      )}

      {currentPosition && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium border border-[var(--success)]/20">
          Vị trí: {currentPosition}
          <button onClick={() => removeFilter("position")} className="hover:text-[var(--foreground)] ml-1">
            <X size={12} />
          </button>
        </span>
      )}

      {(currentMinOvr || currentMaxOvr) && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">
          OVR: {currentMinOvr || "0"} - {currentMaxOvr || "Max"}
          <button 
            onClick={() => {
              updateParams({ minOvr: null, maxOvr: null });
            }} 
            className="hover:text-[var(--foreground)] ml-1"
          >
            <X size={12} />
          </button>
        </span>
      )}

      <button
        onClick={clearAll}
        className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:underline ml-auto"
      >
        Xóa tất cả
      </button>
    </div>
  );
}
