import { createServerFn } from "@tanstack/react-start";
import type { LiveSnapshot } from "@/lib/api/types";

export const getLiveSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveSnapshot> => {
    const { fetchLiveSnapshot } = await import("./thesportsdb.server");
    const snap = await fetchLiveSnapshot();
    try {
      const { listOverrides } = await import("@/lib/admin/store.server");
      const { getCatalog } = await import("@/lib/catalog/store.server");
      const { listBadgeOverrides, listNameOverrides } = await import("@/lib/badges/store.server");
      const catalog = await getCatalog();
      return {
        ...snap,
        overrides: await listOverrides(),
        catalogTeams: catalog.teams,
        catalogMatches: catalog.matches,
        badgeOverrides: await listBadgeOverrides(),
        nameOverrides: await listNameOverrides(),
      };
    } catch {
      return snap;
    }
  },
);
