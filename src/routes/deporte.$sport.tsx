import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Crest } from "@/components/crest";
import { MatchCard } from "@/components/match-card";
import { SportMark } from "@/components/sport-mark";
import { StandingsTable } from "@/components/standings-table";
import { leagueById } from "@/data/leagues";
import { teams } from "@/data/teams";
import { useFeed } from "@/lib/api/feed";
import { recentOf, upcomingOf } from "@/lib/api/merge";
import { SPORTS, sportLabel } from "@/lib/sports";
import type { Sport } from "@/lib/types";

export const Route = createFileRoute("/deporte/$sport")({
  component: SportPage,
});

function isSport(value: string): value is Sport {
  return SPORTS.some((s) => s.id === value);
}

function SportPage() {
  const { sport } = Route.useParams();
  if (!isSport(sport)) throw notFound();
  const { live, all, standings } = useFeed();
  const sportTeams = teams.filter((t) => t.sport === sport);
  const liveNow = live.filter((m) => m.sport === sport);
  const upcoming = upcomingOf(
    all.filter((m) => m.sport === sport),
    8,
  );
  const recent = recentOf(
    all.filter((m) => m.sport === sport),
    8,
  );
  const leagueIds = [...new Set(sportTeams.map((t) => t.leagueId))];

  return (
    <div className="space-y-10">
      <header className="flex items-start gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-surface text-accent shadow-[var(--shadow-border)]">
          <SportMark sport={sport} className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-5xl leading-none">{sportLabel[sport]}</h1>
          <p className="mt-1 text-sm text-muted">
            {sportTeams.length} {sportTeams.length === 1 ? "equipo melillense" : "equipos melillenses"}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {sportTeams.map((t) => (
          <Link
            key={t.id}
            to="/equipo/$slug"
            params={{ slug: t.id }}
            className="flex items-center gap-3 rounded-xl bg-surface p-3.5 shadow-[var(--shadow-border)] transition-colors duration-150 hover:bg-surface-2"
          >
            <Crest team={t} size={44} />
            <span className="min-w-0">
              <span className="block truncate font-medium">{t.name}</span>
              <span className="block truncate text-xs text-muted">
                {t.category} · {t.gender === "f" ? "Femenino" : t.gender === "m" ? "Masculino" : "Mixto"}
              </span>
            </span>
          </Link>
        ))}
      </section>

      {liveNow.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-3xl leading-none">En directo</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {liveNow.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-3xl leading-none">Resultados</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {recent.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-3xl leading-none">Calendario</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {leagueIds.map((id) => {
        const league = leagueById[id];
        if (!league) return null;
        const highlight = sportTeams.find((t) => t.leagueId === id)?.id;
        return (
          <section key={id}>
            <h2 className="mb-1 font-display text-3xl leading-none">Clasificación</h2>
            <p className="mb-4 text-sm text-muted">{league.name}</p>
            <StandingsTable
              rows={standings(id)}
              highlightId={highlight}
              scoring={league.scoring}
            />
          </section>
        );
      })}
    </div>
  );
}
