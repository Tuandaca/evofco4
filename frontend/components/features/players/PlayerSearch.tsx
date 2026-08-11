"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { Search, X } from "lucide-react";

export function PlayerSearch() {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  
  const currentSearch = searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(currentSearch);

  // Sync internal state if URL changes externally
  useEffect(() => {
    // eslint-disable-next-line
    setInputValue(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only push update if the value has changed from the URL's current value
      if (inputValue !== (searchParams.get("search") || "")) {
        updateParams({ search: inputValue || null });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [inputValue, searchParams, updateParams]);

  const handleClear = () => {
    setInputValue("");
    updateParams({ search: null });
  };

  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-[var(--foreground-muted)]" />
      </div>
      <input
        type="text"
        placeholder="Nhập tên cầu thủ (VD: Ronaldo, Messi)..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="block w-full pl-10 pr-10 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all shadow-sm"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          aria-label="Xóa tìm kiếm"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
