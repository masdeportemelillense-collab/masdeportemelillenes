import { Link } from "@tanstack/react-router";
import { Crest, OpponentMark } from "@/components/crest";
import { SportMark } from "@/components/sport-mark";
import { Badge } from "@/components/ui/badge";
import { leagueById } from "@/data/leagues";
import { getTeam } from "@/data/teams";
import { teamResult } from "@/lib/live";
import { sportLabel } from "@/lib/sports";
import type { ResolvedMatch } from "@/lib/types";
import { cn } from "@/lib/utils";

function Side({
  id,
  name,
  short,
  align,
  badgeUrl,
}: {
  id?: string;
  name: string;
  short: string;
  align: "left" | "right";
  badgeUrl?: string;
}) {
  const team = id ? getTeam(id) : undefined;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2.5",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      {team ? (
        <Crest team={team} size={36} />
      ) : (
        <OpponentMark short={short} name={name} size={36} badgeUrl={badgeUrl} />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-fg">{name}</p>
        <p className="truncate text-xs text-muted">{short}</p>
      </div>
    </div>
  );
}

function StatusChip({ match }: { match: ResolvedMatch }) {
  if (match.status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-live">
        <span className="pulse-live size-1.5 rounded-full bg-live" />
        {match.source === "api" ? "Oficial" : "En directo"} · {match.displayClock}
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
        {match.source === "api" ? "Final oficial" : "Final"}
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
      {formatKickoff(match.kickoff)}
    </span>
  );
}

export function competitionLine(match: ResolvedMatch): string {
  const league = leagueById[match.leagueId];
  const name = league?.shortName ?? match.competition ?? match.leagueId;
  if (match.isCup || league?.format === "cup") return name;
  if (match.jornada > 0) return `${name} · J${match.jornada}`;
  return `${name} · Amistoso`;
}

export function formatKickoff(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Madrid",
  });
}

export function MatchCard({
  match,
  highlightId,
}: {
  match: ResolvedMatch;
  highlightId?: string;
}) {
  const result = highlightId ? teamResult(match, highlightId) : null;

  return (
    <Link
      to="/partido/$id"
      params={{ id: match.id }}
      className="block rounded-xl bg-surface p-3.5 shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-surface-2"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-muted">
          <SportMark sport={match.sport} />
          <span className="truncate text-xs">
            {sportLabel[match.sport]} · {competitionLine(match)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {result === "W" && <Badge variant="win">Victoria</Badge>}
          {result === "D" && <Badge variant="draw">Empate</Badge>}
          {result === "L" && <Badge variant="loss">Derrota</Badge>}
          <StatusChip match={match} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Side
          id={match.homeId}
          name={match.homeName}
          short={match.homeShort}
          align="left"
          badgeUrl={match.homeBadge}
        />
        <div className="w-16 shrink-0 text-center sm:w-[5.5rem]">
          {match.status === "scheduled" ? (
            <p className="font-display text-xl leading-none text-muted tabular-nums sm:text-2xl">
              {new Date(match.kickoff).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Madrid",
              })}
            </p>
          ) : (
            <p
              className={cn(
                "font-display text-[1.65rem] leading-none tabular-nums sm:text-[2rem]",
                match.status === "live" && "text-live",
              )}
            >
              {match.homeScore}
              <span className="mx-1 text-muted">–</span>
              {match.awayScore}
            </p>
          )}
        </div>
        <Side
          id={match.awayId}
          name={match.awayName}
          short={match.awayShort}
          align="right"
          badgeUrl={match.awayBadge}
        />
      </div>
      <p className="mt-3 truncate text-xs text-subtle">{match.venue}</p>
    </Link>
  );
}

export function MatchRow({ match }: { match: ResolvedMatch }) {
  return (
    <Link
      to="/partido/$id"
      params={{ id: match.id }}
      className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-surface-2"
    >
      <div className="w-16 shrink-0">
        {match.status === "live" ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase text-live">
            <span className="pulse-live size-1.5 rounded-full bg-live" />
            {match.displayClock}
          </span>
        ) : match.status === "finished" ? (
          <span className="text-[11px] uppercase text-muted">Fin</span>
        ) : (
          <span className="text-[11px] tabular-nums text-muted">
            {new Date(match.kickoff).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/Madrid",
            })}
          </span>
        )}
      </div>
      <p className="min-w-0 flex-1 truncate text-sm">
        {match.homeName} <span className="text-muted">–</span> {match.awayName}
      </p>
      <p className="font-display text-lg leading-none tabular-nums">
        {match.status === "scheduled" ? "–" : `${match.homeScore}–${match.awayScore}`}
      </p>
    </Link>
  );
}
