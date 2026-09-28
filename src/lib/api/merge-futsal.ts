import type { ApiEvent, LiveSnapshot } from "@/lib/api/types";

const RFEF_LEAGUES = new Set(["fs-primera-f", "fs-segunda-m", "fs-segunda-f"]);

export async function mergeFutsal(base: LiveSnapshot): Promise<LiveSnapshot> {
  let events: ApiEvent[] = base.events.filter((e) => e.sport !== "futsal");
  let tables = { ...base.tables };

  try {
    const { fetchRfefFutsal } = await import("./rfef-futsal.server");
    const rfef = await fetchRfefFutsal();
    events = [...events, ...rfef.events];
    tables = { ...tables, ...rfef.tables };
  } catch {
    /* keep going */
  }

  try {
    const { fetchLaPreferenteFutsal } = await import("./lapreferente.server");
    const lp = await fetchLaPreferenteFutsal();
    for (const ev of lp.events) {
      if (RFEF_LEAGUES.has(ev.leagueId) && tables[ev.leagueId]?.length) continue;
      events.push(ev);
    }
    for (const [id, rows] of Object.entries(lp.tables)) {
      if (!tables[id]?.length) tables[id] = rows;
    }
  } catch {
    /* keep going */
  }

  if (events.some((e) => e.sport === "futsal") || Object.keys(tables).length) {
    return { ...base, ok: true, events, tables };
  }

  try {
    const { fetchSoloFutsalEvents } = await import("./solofutsal.server");
    const extra = await fetchSoloFutsalEvents();
    const byId = new Map(events.map((e) => [e.externalId, e]));
    for (const ev of extra) byId.set(ev.externalId, ev);
    return { ...base, ok: true, events: [...byId.values()], tables };
  } catch {
    return { ...base, events, tables };
  }
}
