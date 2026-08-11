import Link from "next/link";
import Image from "next/image";
import { getOvrColorClass } from "@/lib/utils/cn";
import { formatKrPrice } from "@/lib/utils/cn";
import { useState } from "react";
import type { PlayerListItem } from "@/types/api/players";
import { Users, Coins, User } from "lucide-react";

interface PlayerCardProps {
  player: PlayerListItem;
  viewMode?: "grid" | "compact";
}

export function PlayerCard({ player, viewMode = "grid" }: PlayerCardProps) {
  const [imgError, setImgError] = useState(false);
  
  const season = player.defaultSeason;
  const ovr = season?.ovr ?? 0;
  const pos = season?.pos1 ?? "-";
  const seasonCode = season?.seasonCode ?? "";
  const teamName = season?.teamName ?? "N/A";
  const nationName = season?.nationName ?? "N/A";
  const priceKr = season?.priceKr ?? 0;
  
  const ovrColor = getOvrColorClass(ovr);

  // If compact view, render a row
  if (viewMode === "compact") {
    return (
      <Link
        href={`/players/${player.playerId}`}
        className="group relative flex items-center gap-4 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:border-[var(--primary)]/30 transition-all duration-200"
      >
        {/* Compact OVR Badge */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg text-white shrink-0 shadow-inner ${ovrColor}`}
        >
          {ovr}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
              {player.name}
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-sm bg-[var(--muted)] text-[var(--foreground-muted)] whitespace-nowrap">
              {pos}
            </span>
            {seasonCode && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] whitespace-nowrap">
                {seasonCode}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--foreground-muted)]">
            <span className="truncate max-w-[120px] sm:max-w-none">{teamName}</span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[var(--border)]" />
            <span className="truncate max-w-[100px] sm:max-w-none">{nationName}</span>
          </div>
        </div>

        {/* Price (if available) */}
        {priceKr > 0 && (
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div className="text-xs font-medium text-[var(--foreground-muted)] mb-0.5">
              Giá trị
            </div>
            <div className="text-sm font-semibold text-[var(--primary)]">
              {formatKrPrice(priceKr)}
            </div>
          </div>
        )}
      </Link>
    );
  }

  // Grid view (Default)
  return (
    <Link
      href={`/players/${player.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:border-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/5 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Top Banner (Season & Position) */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 z-10 bg-gradient-to-b from-black/60 to-transparent">
        {seasonCode && (
          <span className="text-xs font-black px-1.5 py-0.5 rounded shadow-sm border border-white/10 bg-black/40 text-white backdrop-blur-sm tracking-wider">
            {seasonCode}
          </span>
        )}
        <span className="text-xs font-bold px-2 py-0.5 rounded-full shadow-sm bg-black/60 text-white backdrop-blur-sm border border-white/10">
          {pos}
        </span>
      </div>

      {/* Image & OVR Section */}
      <div className="relative pt-8 pb-4 px-4 bg-gradient-to-b from-[var(--background-subtle)] to-[var(--card)] flex flex-col items-center border-b border-[var(--border)]">
        {/* Background glow based on OVR */}
        <div
          className={`absolute inset-0 opacity-10 ${ovrColor}`}
          style={{
            background: "radial-gradient(circle at 50% 50%, currentColor 0%, transparent 70%)",
          }}
        />
        
        {/* Image Container */}
        <div className="relative w-24 h-24 mb-3 drop-shadow-xl z-10 transition-transform duration-300 group-hover:scale-110">
          {player.imageUrl && !imgError ? (
            <Image
              src={player.imageUrl}
              alt={player.name}
              fill
              sizes="96px"
              className="object-contain"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--muted)] rounded-full border-2 border-[var(--border)]/50">
              <User size={40} className="text-[var(--foreground-muted)] opacity-50" />
            </div>
          )}
        </div>

        {/* OVR Badge */}
        <div
          className={`relative z-10 flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-full font-black text-xl text-white shadow-lg ${ovrColor}`}
        >
          {ovr}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-[var(--foreground)] text-center text-sm mb-3 group-hover:text-[var(--primary)] transition-colors line-clamp-2 min-h-[40px]">
          {player.name}
        </h3>

        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)] shrink-0" />
            <span className="truncate">{teamName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)] shrink-0" />
            <span className="truncate">{nationName}</span>
          </div>
          
          {priceKr > 0 && (
            <div className="pt-2 mt-2 border-t border-[var(--border)] flex items-center justify-center gap-1.5">
              <Coins size={12} className="text-[var(--primary)]" />
              <span className="text-xs font-bold text-[var(--foreground)]">
                {formatKrPrice(priceKr)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
