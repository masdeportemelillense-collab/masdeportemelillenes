import type { AdminOverride } from "@/lib/admin/types";
import type { ResolvedMatch } from "@/lib/types";

export function applyAdminOverrides(
  list: ResolvedMatch[],
  overrides: AdminOverride[] | undefined,
): ResolvedMatch[] {
  if (!overrides?.length) return list;
  const byId = new Map(overrides.map((o) => [o.matchId, o]));
  const out: ResolvedMatch[] = [];

  for (const match of list) {
    const hit = byId.get(match.id) || (match.externalId ? byId.get(match.externalId) : undefined);
    if (!hit) {
      out.push(match);
      continue;
    }
    if (hit.deleted) continue;
    const homeScore = hit.homeScore ?? match.homeScore;
    const awayScore = hit.awayScore ?? match.awayScore;
    const status = hit.status ?? match.status;
    out.push({
      ...match,
      homeName: hit.homeName || match.homeName,
      awayName: hit.awayName || match.awayName,
      venue: hit.venue || match.venue,
      jornada: hit.jornada ?? match.jornada,
      kickoff: hit.kickoff || match.kickoff,
      status,
      homeScore: status === "scheduled" ? 0 : homeScore,
      awayScore: status === "scheduled" ? 0 : awayScore,
      minute: hit.minute ?? match.minute,
      displayClock: status === "live" ? "LIVE" : status === "finished" ? "Fin" : match.displayClock,
      period:
        status === "live" ? "En directo" : status === "finished" ? "Finalizado" : "Previsto",
      events:
        status === "scheduled"
          ? []
          : [
              {
                minute: hit.minute ?? 40,
                side: homeScore >= awayScore ? "home" : "away",
                kind: "gol",
                player: hit.note || "Admin",
                homeScore,
                awayScore,
              },
            ],
      happened:
        status === "scheduled"
          ? []
          : [
              {
                minute: hit.minute ?? 40,
                side: homeScore >= awayScore ? "home" : "away",
                kind: "gol",
                player: hit.note || "Admin",
                homeScore,
                awayScore,
              },
            ],
      source: match.source ?? "catalog",
    });
  }

  return out;
}
