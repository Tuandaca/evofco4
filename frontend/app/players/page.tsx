import type { Metadata } from "next";
import { Suspense } from "react";
import { getPlayers } from "@/lib/api/players";
import { getPositions } from "@/lib/api/filters";
import { getSeasons } from "@/lib/api/seasons";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { PlayerSearch } from "@/components/features/players/PlayerSearch";
import { FilterSidebar } from "@/components/features/players/FilterSidebar";
import { ActiveFilters } from "@/components/features/players/ActiveFilters";
import { SortDropdown } from "@/components/features/players/SortDropdown";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageSkeleton } from "@/components/shared/skeletons/Skeletons";
import { Users } from "lucide-react";
import { PlayerListClient } from "@/components/features/players/PlayerListClient";

export const metadata: Metadata = {
  title: "Cầu thủ | FC Upgrade Intelligence",
  description:
    "Tra cứu toàn bộ cầu thủ FC Online với thống kê chi tiết, lọc theo Season, vị trí, đội bóng và quốc tịch.",
};

// Next.js config for search params
interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function PlayersPage({ searchParams }: PageProps) {
  // Await the searchParams in Next.js 15+ if needed, but in 14 it's okay as is, though Next 15 requires awaiting it.
  // We'll treat searchParams as a Promise to be safe for React 19 / Next.js 15 compatibility
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = Number(resolvedSearchParams.pageSize) || 24;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;
  const position = typeof resolvedSearchParams.position === "string" ? resolvedSearchParams.position : undefined;
  const seasonCode = typeof resolvedSearchParams.seasonCode === "string" ? resolvedSearchParams.seasonCode : undefined;
  const minOvr = resolvedSearchParams.minOvr ? Number(resolvedSearchParams.minOvr) : undefined;
  const maxOvr = resolvedSearchParams.maxOvr ? Number(resolvedSearchParams.maxOvr) : undefined;
  const sortBy = typeof resolvedSearchParams.sortBy === "string" ? (resolvedSearchParams.sortBy as "ovr" | "name" | "price" | "height" | "age" | "updatedAt") : "ovr";
  const sortDirection = typeof resolvedSearchParams.sortDirection === "string" ? (resolvedSearchParams.sortDirection as "asc" | "desc") : "desc";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Cầu thủ"
        description="Khám phá toàn bộ cơ sở dữ liệu cầu thủ FC Online. Lọc theo Season, vị trí, đội bóng, quốc tịch và chỉ số OVR."
        badge={
          <Badge variant="success" className="w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            Milestone 3B
          </Badge>
        }
        className="mb-8"
      />

      <Suspense fallback={<PageSkeleton />}>
        <PlayersContent
          page={page}
          pageSize={pageSize}
          search={search}
          position={position}
          seasonCode={seasonCode}
          minOvr={minOvr}
          maxOvr={maxOvr}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </Suspense>
    </div>
  );
}

interface PlayersContentProps {
  page: number;
  pageSize: number;
  search?: string;
  position?: string;
  seasonCode?: string;
  minOvr?: number;
  maxOvr?: number;
  sortBy?: "ovr" | "name" | "price" | "height" | "age" | "updatedAt";
  sortDirection?: "asc" | "desc";
}

async function PlayersContent(props: PlayersContentProps) {
  // Fetch metadata and data in parallel
  const [positionsRes, seasonsRes, playersRes] = await Promise.all([
    getPositions().catch(() => ({ data: [] })), // Graceful degradation for filters
    getSeasons({ pageSize: 100 }).catch(() => ({ data: { items: [] } })),
    getPlayers({ ...props }),
  ]);

  if (!playersRes.data) {
    return (
      <ErrorState
        title="Không thể tải dữ liệu cầu thủ"
        description="Backend API hiện không phản hồi hoặc đang bảo trì. Vui lòng thử lại sau."
      />
    );
  }

  const positions = positionsRes.data || [];
  // @ts-expect-error - seasons data structure
  const seasons = seasonsRes.data?.items || [];
  const { items, totalItems, totalPages, page: currentPage } = playersRes.data;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return (
    <div className="flex flex-col sm:flex-row gap-8">
      {/* Sidebar Filter */}
      <FilterSidebar positions={positions} seasons={seasons} />

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <PlayerSearch />
          <div className="flex items-center gap-3">
            <SortDropdown />
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters seasons={seasons} />

        {/* Results */}
        {items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Không tìm thấy cầu thủ"
            description="Thử thay đổi từ khóa hoặc xóa bớt bộ lọc để xem nhiều kết quả hơn."
          />
        ) : (
          <PlayerListClient items={items} />
        )}

        {/* Pagination */}
        {items.length > 0 && (
          <Pagination
            currentPage={props.page}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            totalCount={totalItems}
          />
        )}
      </div>
    </div>
  );
}
