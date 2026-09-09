import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Crest, OpponentMark } from "@/components/crest";
import { competitionLine, formatKickoff } from "@/components/match-card";
import { SportMark } from "@/components/sport-mark";
import { Badge } from "@/components/ui/badge";
import { leagueById } from "@/data/leagues";
import { matchById } from "@/data/matches";
import { getTeam } from "@/data/teams";
import { useFeed } from "@/lib/api/feed";
import { resolveMatch, useNow } from "@/lib/live";
import { sportLabel } from "@/lib/sports";
import type { MatchEvent, ResolvedMatch } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/partido/$id")({
  component: MatchPage,
});

function MatchPage() {
  const { id } = Route.useParams();
  const now = useNow();
  const feed = useFeed();
  const raw = matchById[id];
  const match = feed.byId[id] ?? (raw ? resolveMatch(raw, now) : undefined);
  if (!match) {
    if (!feed.fetchedAt) {
      return (
        <div className="rounded-xl bg-surface px-4 py-16 text-center text-sm text-muted shadow-[var(--shadow-border)]">
          Cargando marcador…
        </div>
      );
    }
    throw notFound();
  }
  const league = leagueById[match.leagueId];
  const home = match.homeId ? getTeam(match.homeId) : undefined;
  const away = match.awayId ? getTeam(match.awayId) : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
        <SportMark sport={match.sport} />
        {sportLabel[match.sport]} · {competitionLine(match)}
      </p>

      <section className="rounded-2xl bg-surface px-4 py-8 text-center shadow-[var(--shadow-border)] sm:px-8">
        {match.status === "live" && (
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-live">
            <span className="pulse-live size-1.5 rounded-full bg-live" />
            {match.source === "api" ? "Marcador oficial" : "En directo"} · {match.period} ·{" "}
            {match.displayClock}
          </p>
        )}
        {match.status === "finished" && (
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted">
            {match.source === "api" ? "Final oficial" : "Finalizado"}
          </p>
        )}
        {match.status === "scheduled" && (
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted">
            {formatKickoff(match.kickoff)}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <TeamBlock
            id={match.homeId}
            name={match.homeName}
            short={match.homeShort}
            team={home}
            badgeUrl={match.homeBadge}
          />
          <div className="min-w-[7rem]">
            {match.status === "scheduled" ? (
              <p className="font-display text-5xl leading-none text-muted">vs</p>
            ) : (
              <p
                className={cn(
                  "font-display text-6xl leading-none tabular-nums sm:text-7xl",
                  match.status === "live" && "text-live",
                )}
              >
                {match.homeScore}
                <span className="mx-1 text-3xl text-muted">–</span>
                {match.awayScore}
              </p>
            )}
          </div>
          <TeamBlock
            id={match.awayId}
            name={match.awayName}
            short={match.awayShort}
            team={away}
            badgeUrl={match.awayBadge}
          />
        </div>
        <p className="mt-6 text-xs text-subtle">{match.venue}</p>
        {match.source === "api" && (
          <p className="mt-2 text-[11px] uppercase tracking-wider text-accent">
            Actualización automática · TheSportsDB
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-3xl leading-none">Cronología</h2>
        {match.happened.length === 0 ? (
          <p className="rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-[var(--shadow-border)]">
            {match.status === "scheduled"
              ? "El partido aún no ha comenzado."
              : match.source === "api"
                ? "Resultado oficial. Sin cronología detallada de este encuentro."
                : "Sin eventos registrados."}
          </p>
        ) : (
          <ol className="space-y-1 rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]">
            {[...match.happened].reverse().map((ev, i) => (
              <EventRow key={`${ev.minute}-${ev.player}-${i}`} event={ev} match={match} />
            ))}
          </ol>
        )}
      </section>

      {league && (
        <p className="text-xs text-subtle">{league.name}</p>
      )}
    </div>
  );
}

function TeamBlock({
  id,
  name,
  short,
  team,
  badgeUrl,
}: {
  id?: string;
  name: string;
  short: string;
  team?: ReturnType<typeof getTeam>;
  badgeUrl?: string;
}) {
  const inner = (
    <>
      {team ? (
        <Crest team={team} size={56} />
      ) : (
        <OpponentMark short={short} name={name} size={56} badgeUrl={badgeUrl} />
      )}
      <p className="mt-2 max-w-[8rem] text-sm font-medium sm:max-w-none">{name}</p>
    </>
  );
  if (!id) return <div className="flex min-w-0 flex-1 flex-col items-center">{inner}</div>;
  return (
    <Link
      to="/equipo/$slug"
      params={{ slug: id }}
      className="flex min-w-0 flex-1 flex-col items-center hover:text-accent"
    >
      {inner}
    </Link>
  );
}

function EventRow({ event, match }: { event: MatchEvent; match: ResolvedMatch }) {
  const kindLabel: Record<string, string> = {
    gol: "Gol",
    gol_pp: "Gol en propia",
    amarilla: "Amarilla",
    roja: "Roja",
    punto: "Anotación",
    set: "Set",
    periodo: "Parcial",
    tiempo: "Tiempo muerto",
  };
  const isHome = event.side === "home";
  return (
    <li className="flex items-center gap-3 rounded-lg px-3 py-2.5">
      <span className="w-10 text-right text-xs tabular-nums text-muted">{event.minute}'</span>
      <Badge
        variant={
          event.kind === "gol" || event.kind === "set" || event.kind === "punto"
            ? "accent"
            : event.kind === "roja"
              ? "loss"
              : "default"
        }
      >
        {kindLabel[event.kind] ?? event.kind}
      </Badge>
      <span className="min-w-0 flex-1 truncate text-sm">
        {event.player}
        <span className="text-muted">
          {" "}
          · {isHome ? match.homeShort : match.awayShort}
        </span>
      </span>
      <span className="font-display text-lg leading-none tabular-nums">
        {event.homeScore}–{event.awayScore}
      </span>
    </li>
  );
}
