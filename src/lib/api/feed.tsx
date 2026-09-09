import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getLiveSnapshot } from "@/lib/api/get-snapshot";
import {
  buildResolvedFeed,
  forTeam,
  formOf,
  liveOf,
  nextOf,
  recentOf,
  standingsOf,
  todayOf,
  upcomingOf,
} from "@/lib/api/merge";
import type { LiveSnapshot } from "@/lib/api/types";
import { useNow } from "@/lib/live";
import type { ResolvedMatch, StandingRow } from "@/lib/types";

/** Official scoreboard cadence — one pull per minute. */
export const POLL_MS = 60_000;

export type Feed = {
  now: number;
  all: ResolvedMatch[];
  live: ResolvedMatch[];
  upcoming: ResolvedMatch[];
  recent: ResolvedMatch[];
  today: ResolvedMatch[];
  byId: Record<string, ResolvedMatch>;
  forTeam: (id: string) => ResolvedMatch[];
  standings: (leagueId: string) => StandingRow[];
  form: (id: string) => Array<"W" | "D" | "L">;
  next: (id: string) => ResolvedMatch | undefined;
  ok: boolean;
  isFetching: boolean;
  fetchedAt: number;
  officialCount: number;
  officialLive: number;
  nextPollIn: number;
};

const FeedContext = createContext<Feed | null>(null);

const EMPTY: LiveSnapshot = { fetchedAt: 0, ok: false, events: [], tables: {} };

function nextPollInMs(now: number, updatedAt: number): number {
  if (!updatedAt) return POLL_MS;
  return Math.max(0, POLL_MS - (now - updatedAt));
}

function makeFeed(
  now: number,
  snapshot: LiveSnapshot,
  extra: { isFetching: boolean; updatedAt: number },
): Feed {
  const all = buildResolvedFeed(now, snapshot);
  const byId = Object.fromEntries(all.map((m) => [m.id, m])) as Record<string, ResolvedMatch>;
  return {
    now,
    all,
    live: liveOf(all),
    upcoming: upcomingOf(all, 8),
    recent: recentOf(all, 8),
    today: todayOf(all, now),
    byId,
    forTeam: (id) => forTeam(all, id),
    standings: (leagueId) => standingsOf(leagueId, all, now, snapshot.tables[leagueId]),
    form: (id) => formOf(all, id),
    next: (id) => nextOf(all, id),
    ok: snapshot.ok,
    isFetching: extra.isFetching,
    fetchedAt: snapshot.fetchedAt,
    officialCount: snapshot.events.length,
    officialLive: snapshot.events.filter((e) => e.status === "live").length,
    nextPollIn: nextPollInMs(now, extra.updatedAt || snapshot.fetchedAt),
  };
}

export function LiveFeedProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: LiveSnapshot | null;
}) {
  const now = useNow();
  const query = useQuery({
    queryKey: ["live-snapshot"],
    queryFn: () => getLiveSnapshot(),
    initialData: initial ?? undefined,
    initialDataUpdatedAt: initial?.fetchedAt,
    staleTime: POLL_MS - 5_000,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const snapshot = query.data ?? EMPTY;
  const value = useMemo(
    () =>
      makeFeed(now, snapshot, {
        isFetching: query.isFetching,
        updatedAt: query.dataUpdatedAt,
      }),
    [now, snapshot, query.isFetching, query.dataUpdatedAt],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed(): Feed {
  const ctx = useContext(FeedContext);
  const now = useNow();
  const fallback = useMemo(() => makeFeed(now, EMPTY, { isFetching: false, updatedAt: 0 }), [now]);
  return ctx ?? fallback;
}
