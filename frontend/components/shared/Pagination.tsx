"use client";

import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  totalCount,
}: PaginationProps) {
  const updateParams = useUpdateSearchParams();
  const searchParams = useSearchParams();

  // If there's 0 or 1 page, we don't really need full pagination controls
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between text-sm text-[var(--foreground-muted)] py-4">
        <span>Hiển thị {totalCount} kết quả</span>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    // Scroll to top of list when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // We bypass the "reset to page 1 on filter change" logic in the hook by sending ONLY page
    updateParams({ page });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5; // max page buttons to show

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first, last, current, and adjacent to current
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  const pageSize = Number(searchParams.get("pageSize") || 24);
  const startCount = (currentPage - 1) * pageSize + 1;
  const endCount = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-sm text-[var(--foreground-muted)]">
        Hiển thị <span className="font-medium text-[var(--foreground)]">{startCount}</span> -{" "}
        <span className="font-medium text-[var(--foreground)]">{endCount}</span> trong số{" "}
        <span className="font-medium text-[var(--foreground)]">{totalCount}</span> cầu thủ
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPreviousPage}
          onClick={() => handlePageChange(currentPage - 1)}
          className="h-9 w-9 p-0"
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
        </Button>

        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <div
                key={`ellipsis-${index}`}
                className="flex items-center justify-center h-9 w-9 text-[var(--foreground-muted)]"
              >
                <MoreHorizontal size={16} />
              </div>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="h-9 w-9 p-0"
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => handlePageChange(currentPage + 1)}
          className="h-9 w-9 p-0"
          aria-label="Trang tiếp theo"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
