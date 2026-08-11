"use client";

import { useSearchParams } from "next/navigation";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { ArrowDownAZ, ArrowDownZA, ArrowDown10, ArrowUp01, ChevronDown } from "lucide-react";

export function SortDropdown() {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();

  const sortBy = searchParams.get("sortBy") || "ovr";
  const sortDirection = searchParams.get("sortDirection") || "desc";
  const currentValue = `${sortBy}-${sortDirection}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortDir] = e.target.value.split("-");
    updateParams({
      sortBy: newSortBy,
      sortDirection: newSortDir,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-[var(--foreground-muted)] hidden sm:inline-block">Sắp xếp:</span>
      <div className="relative">
        <select
          value={currentValue}
          onChange={handleChange}
          className="appearance-none bg-[var(--background)] border border-[var(--border)] rounded-lg pl-9 pr-8 py-2 text-sm font-medium text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] cursor-pointer"
        >
          <option value="ovr-desc">Chỉ số OVR (Cao - Thấp)</option>
          <option value="ovr-asc">Chỉ số OVR (Thấp - Cao)</option>
          <option value="price-desc">Giá trị (Cao - Thấp)</option>
          <option value="price-asc">Giá trị (Thấp - Cao)</option>
          <option value="name-asc">Tên (A - Z)</option>
          <option value="name-desc">Tên (Z - A)</option>
          <option value="updatedAt-desc">Mới cập nhật</option>
        </select>
        
        {/* Dynamic Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none">
          {sortBy === "ovr" || sortBy === "price" ? (
            sortDirection === "desc" ? <ArrowDown10 size={14} /> : <ArrowUp01 size={14} />
          ) : sortBy === "name" ? (
            sortDirection === "desc" ? <ArrowDownZA size={14} /> : <ArrowDownAZ size={14} />
          ) : (
            <ArrowDown10 size={14} />
          )}
        </div>
        
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" />
      </div>
    </div>
  );
}
