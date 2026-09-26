import type { AdminOverride } from "@/lib/admin/types";
import type { EventKind, MatchEvent, ResolvedMatch, Side } from "@/lib/types";

function isScoreEvent(kind: EventKind): boolean {
  return kind === "gol" || kind === "gol_pp" || kind === "punto" || kind === "set";
}

export function finalizeEvents(raw: MatchEvent[]): MatchEvent[] {
  let home = 0;
  let away = 0;
  return [...raw]
    .sort((a, b) => a.minute - b.minute)
    .map((ev) => {
      if (isScoreEvent(ev.kind)) {
        if (ev.kind === "gol_pp") {
          if (ev.side === "home") away += 1;
          else home += 1;
        } else if (ev.side === "home") home += 1;
        else away += 1;
      }
      return { ...ev, homeScore: home, awayScore: away };
    });
}

export function scoreFromEvents(events: MatchEvent[]): { home: number; away: number; minute: number } {
  const last = events[events.length - 1];
  return {
    home: last?.homeScore ?? 0,
    away: last?.awayScore ?? 0,
    minute: last?.minute ?? 0,
  };
}

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
    const status = hit.status ?? match.status;
    const events = hit.events ? finalizeEvents(hit.events) : status === "scheduled" ? [] : match.events;
    const fromEvents = events.length ? scoreFromEvents(events) : null;
    const homeScore = status === "scheduled" ? 0 : (hit.homeScore ?? fromEvents?.home ?? match.homeScore);
    const awayScore = status === "scheduled" ? 0 : (hit.awayScore ?? fromEvents?.away ?? match.awayScore);
    const minute = hit.minute ?? fromEvents?.minute ?? match.minute;

    out.push({
      ...match,
      homeName: hit.homeName || match.homeName,
      awayName: hit.awayName || match.awayName,
      venue: hit.venue || match.venue,
      jornada: hit.jornada ?? match.jornada,
      kickoff: hit.kickoff || match.kickoff,
      status,
      homeScore,
      awayScore,
      minute,
      displayClock:
        status === "live" ? (minute ? `${minute}'` : "LIVE") : status === "finished" ? "Fin" : match.displayClock,
      period: status === "live" ? "En directo" : status === "finished" ? "Finalizado" : "Previsto",
      events,
      happened: events,
      source: match.source ?? "catalog",
    });
  }

  return out;
}

export type DraftEvent = {
  minute: string;
  side: Side;
  kind: EventKind;
  player: string;
};

export function draftsToEvents(rows: DraftEvent[]): MatchEvent[] {
  return finalizeEvents(
    rows
      .filter((row) => row.player.trim() || isScoreEvent(row.kind))
      .map((row) => ({
        minute: Number(row.minute) || 0,
        side: row.side,
        kind: row.kind,
        player: row.player.trim() || (row.kind === "gol" || row.kind === "gol_pp" ? "Gol" : row.kind),
        homeScore: 0,
        awayScore: 0,
      })),
  );
}
