"use client";

import { useState, useEffect } from "react";
import { PlayerCard } from "@/components/features/players/PlayerCard";
import { PlayerViewToggle } from "@/components/features/players/PlayerViewToggle";
import type { PlayerListItem } from "@/types/api/players";

interface PlayerListClientProps {
  items: PlayerListItem[];
}

export function PlayerListClient({ items }: PlayerListClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  // Load preferred view mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("player-view-mode");
    if (saved === "compact" || saved === "grid") {
      // eslint-disable-next-line
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "grid" | "compact") => {
    setViewMode(mode);
    localStorage.setItem("player-view-mode", mode);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <PlayerViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            : "flex flex-col gap-2"
        }
      >
        {items.map((player) => (
          <PlayerCard key={player.id} player={player} viewMode={viewMode} />
        ))}
      </div>
    </>
  );
}
