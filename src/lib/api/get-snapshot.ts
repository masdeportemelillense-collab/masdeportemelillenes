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
      const { listOverrides, upsertOverride } = await import("@/lib/admin/store.server");
      const { getCatalog } = await import("@/lib/catalog/store.server");
      const { listBadgeOverrides, listNameOverrides } = await import("@/lib/badges/store.server");
      const { scrapeLiveScore } = await import("@/lib/admin/live-scrape.server");

      const extras = await withTimeout(
        (async () => {
          const catalog = await getCatalog();
          const overrides = await listOverrides();

          // Poll any liveUrl overrides (best-effort, max 3 per snapshot to stay fast)
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
              // ignore individual scrape failures
            }
          }

          return {
            overrides: await listOverrides(), // re-read after possible updates
            catalogTeams: catalog.teams,
            catalogMatches: catalog.matches,
            badgeOverrides: await listBadgeOverrides(),
            nameOverrides: await listNameOverrides(),
          };
        })(),
        6000,
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
