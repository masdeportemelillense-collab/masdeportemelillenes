import { createServerFn } from "@tanstack/react-start";
import type { Group9Round } from "./group9.server";

export const getGroup9 = createServerFn({ method: "GET" })
  .inputValidator((d: { jornada?: number }) => d)
  .handler(async ({ data }): Promise<Group9Round | null> => {
    try {
      const { fetchGroup9 } = await import("./group9.server");
      const round = await fetchGroup9(Number(data?.jornada) || undefined);
      const { listGroup9Scores } = await import("@/lib/group9/store.server");
      const overrides = await listGroup9Scores();
      const key = (home: string, away: string) =>
        `${round.jornada}|${home.toLowerCase()}|${away.toLowerCase()}`;
      return {
        ...round,
        matches: round.matches.map((m) => {
          const hit = overrides.find((o) => o.key === key(m.home, m.away));
          return hit ? { ...m, score: hit.score, played: true } : m;
        }),
      };
    } catch (err) {
      console.error("[group9]", err);
      return null;
    }
  });
