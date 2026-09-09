import { Link } from "@tanstack/react-router";
import { useFeed } from "@/lib/api/feed";
import type { ResolvedMatch } from "@/lib/types";

function Item({ match }: { match: ResolvedMatch }) {
  return (
    <Link
      to="/partido/$id"
      params={{ id: match.id }}
      className="mx-6 inline-flex items-center gap-3 whitespace-nowrap text-sm"
    >
      <span className="pulse-live size-1.5 rounded-full bg-live" />
      <span className="text-muted">{match.homeShort}</span>
      <span className="font-display text-lg leading-none tabular-nums text-live">
        {match.homeScore}–{match.awayScore}
      </span>
      <span className="text-muted">{match.awayShort}</span>
      <span className="text-xs uppercase tracking-wider text-subtle">{match.displayClock}</span>
      {match.source === "api" && (
        <span className="text-[10px] uppercase tracking-wider text-accent">oficial</span>
      )}
    </Link>
  );
}

export function LiveTicker() {
  const { live } = useFeed();
  if (!live.length) return null;
  const loop = [...live, ...live, ...live, ...live];
  return (
    <div className="relative w-full max-w-full overflow-x-clip border-y border-border bg-surface">
      <div className="flex ticker py-2.5 will-change-transform">
        {loop.map((m, i) => (
          <Item key={`${m.id}-${i}`} match={m} />
        ))}
      </div>
    </div>
  );
}
