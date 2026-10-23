import { createServerFn } from "@tanstack/react-start";
import type { LiveSnapshot } from "@/lib/api/types";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

const EMPTY_SNAP: LiveSnapshot = {
  fetchedAt: Date.now(),
  ok: false,
  error: "timeout",
  events: [],
  tables: {},
};

export const getLiveSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveSnapshot> => {
    const { fetchLiveSnapshot } = await import("./thesportsdb.server");

    const snap = await withTimeout(fetchLiveSnapshot(), 8000, EMPTY_SNAP);

    try {
      const { listOverrides, upsertOverride, removeOverride } = await import("@/lib/admin/store.server");
      const { getCatalog } = await import("@/lib/catalog/store.server");
      const { listBadgeOverrides, listNameOverrides } = await import("@/lib/badges/store.server");
      const { scrapeLiveScore } = await import("@/lib/admin/live-scrape.server");

      const extras = await withTimeout(
        (async () => {
          const catalog = await getCatalog();
          let overrides = await listOverrides();

          // Force clean the Rusadir match (dhj-41) if it has a bad score
          const rusadir = overrides.find((o) => o.matchId === "dhj-41");
          if (rusadir && ((rusadir.homeScore ?? 0) > 10 || (rusadir.awayScore ?? 0) > 10)) {
            await upsertOverride({
              ...rusadir,
              homeScore: 0,
              awayScore: 0,
              updatedAt: Date.now(),
            });
            overrides = await listOverrides();
          }

          // Poll liveUrl overrides
          const withUrl = overrides.filter((o) => o.liveUrl && o.status === "live").slice(0, 3);
          for (const ov of withUrl) {
            try {
              const score = await scrapeLiveScore(ov.liveUrl!);
              if (score && (score.home !== ov.homeScore || score.away !== ov.awayScore)) {
                await upsertOverride({
                  ...ov,
                  homeScore: score.home,
                  awayScore: score.away,
                  status: "live",
                  updatedAt: Date.now(),
                });
              }
            } catch {
              // ignore
            }
          }

          return {
            overrides: await listOverrides(),
            catalogTeams: catalog.teams,
            catalogMatches: catalog.matches,
            badgeOverrides: await listBadgeOverrides(),
            nameOverrides: await listNameOverrides(),
          };
        })(),
        12000,
        {
          overrides: [] as any[],
          catalogTeams: [] as any[],
          catalogMatches: [] as any[],
          badgeOverrides: [] as any[],
          nameOverrides: [] as any[],
        },
      );

      return { ...snap, ...extras };
    } catch {
      return snap;
    }
  },
);
