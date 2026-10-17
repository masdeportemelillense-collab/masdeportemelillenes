import { createServerFn } from "@tanstack/react-start";
import type { LiveSnapshot } from "@/lib/api/types";

// TEMP: return empty snapshot immediately so the page never hangs.
// Live data will be re-enabled once the external APIs are stable.
export const getLiveSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveSnapshot> => {
    return {
      fetchedAt: Date.now(),
      ok: false,
      error: "live temporarily disabled",
      events: [],
      tables: {},
      overrides: [],
      catalogTeams: [],
      catalogMatches: [],
      badgeOverrides: [],
      nameOverrides: [],
    };
  },
);
