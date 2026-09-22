import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star } from "lucide-react";
import { Crest } from "@/components/crest";
import { formatDay, MatchCard } from "@/components/match-card";
import { SportMark } from "@/components/sport-mark";
import { StandingsTable } from "@/components/standings-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CUP_LEAGUE_IDS, leagueById } from "@/data/leagues";
import { getSquad, groupSquad, type TeamSquad } from "@/data/squads";
import { getTeam } from "@/data/teams";
import { useFeed } from "@/lib/api/feed";
import { getTeamSquad } from "@/lib/api/squad";
import { useFavorite } from "@/lib/favorites";
import { GENDER_LABEL, sportLabel } from "@/lib/sports";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equipo/$slug")({
  component: TeamPage,
});

function TeamPage() {
  const { slug } = Route.useParams();
  const team = getTeam(slug);
  if (!team) throw notFound();
  const feed = useFeed();
  const league = leagueById[team.leagueId];
  const all = feed.forTeam(team.id);
  const cupMatches = all.filter((m) => CUP_LEAGUE_IDS.has(m.leagueId));
  const leagueMatches = all.filter((m) => !CUP_LEAGUE_IDS.has(m.leagueId));
  const results = [...leagueMatches].filter((m) => m.status === "finished").reverse();
  const calendar = leagueMatches.filter((m) => m.status !== "finished");
  const cupResults = [...cupMatches].filter((m) => m.status === "finished").reverse();
  const cupCalendar = cupMatches.filter((m) => m.status !== "finished");
  const live = all.filter((m) => m.status === "live");
  const next = feed.next(team.id);
  const form = feed.form(team.id);
  const table = feed.standings(team.leagueId);
  const pos = table.find((r) => r.teamId === team.id);
  const { fav, toggle } = useFavorite(team.id);
  const local = getSquad(team.id);
  const remote = useQuery({
    queryKey: ["squad", team.id],
    queryFn: () => getTeamSquad({ data: { teamId: team.id } }),
    enabled: Boolean(local),
    staleTime: 30 * 60_000,
    refetchInterval: 6 * 60 * 60_000,
  });
  const squad = (remote.data as TeamSquad | null) ?? local;
  const showCopa = cupMatches.length > 0;
  const copaName =
    cupMatches[0] ? leagueById[cupMatches[0].leagueId]?.name ?? "Copa" : "Copa";

  const groupedCalendar = groupByDay(calendar.map((m) => ({ ...m, sort: m.kickoff })));
  const groupedCup = groupByDay([...cupResults, ...cupCalendar].map((m) => ({ ...m, sort: m.kickoff })));

  return (
    <div className="space-y-8">
      <header className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        <div className="h-1.5" style={{ background: team.primary }} />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
          <Crest team={team} size={72} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
              <SportMark sport={team.sport} className="size-3.5" />
              {sportLabel[team.sport]} · {GENDER_LABEL[team.gender]} · {team.category}
            </p>
            <h1 className="mt-1 font-display text-5xl leading-none">{team.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">{team.summary}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-subtle">
              <MapPin className="size-3.5" />
              {team.venue} · Fundado en {team.founded}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggle(team.id)}
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-medium",
              fav ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg",
            )}
          >
            <Star className={fav ? "size-4 fill-current" : "size-4"} />
            {fav ? "Favorito" : "Seguir"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
          <Stat label="Liga" value={league?.shortName ?? "—"} />
          <Stat label="Puesto" value={pos ? `${pos.pos}º` : "—"} />
          <Stat label="Forma" value={form.length ? form.join("  ") : "Sin partidos"} />
          <Stat
            label="Siguiente"
            value={next ? `${next.homeId === team.id ? next.awayShort : next.homeShort}` : "—"}
          />
        </div>
      </header>

      {live.map((m) => (
        <MatchCard key={m.id} match={m} highlightId={team.id} />
      ))}

      <Tabs defaultValue="resultados">
        <TabsList>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="clasificacion">Clasificación</TabsTrigger>
          {showCopa ? <TabsTrigger value="copa">{copaName}</TabsTrigger> : null}
          {squad ? <TabsTrigger value="plantilla">Plantilla</TabsTrigger> : null}
        </TabsList>
        <TabsContent value="resultados">
          {results.length === 0 ? (
            <Empty text="Aún no hay resultados oficiales de liga." />
          ) : (
            <div className="grid gap-3">
              {results.map((m) => (
                <MatchCard key={m.id} match={m} highlightId={team.id} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="calendario">
          {calendar.length === 0 ? (
            <Empty text="No hay partidos programados." />
          ) : (
            <div className="space-y-6">
              {groupedCalendar.map(([day, list]) => (
                <div key={day}>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                    {formatDay(list[0].kickoff)}
                  </p>
                  <div className="grid gap-3">
                    {list.map((m) => (
                      <MatchCard key={m.id} match={m} highlightId={team.id} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="clasificacion">
          {league ? (
            <>
              <p className="mb-4 text-sm text-muted">{league.name}</p>
              <StandingsTable
                rows={table}
                highlightId={team.id}
                scoring={league.scoring}
              />
            </>
          ) : (
            <Empty text="Clasificación no disponible." />
          )}
        </TabsContent>
        {showCopa ? (
          <TabsContent value="copa">
            {cupMatches.length === 0 ? (
              <Empty text="Todavía no hay partidos de copa." />
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-muted">
                  Fase de grupos de la Copa de España. Resultados y próximos partidos.
                </p>
                {groupedCup.map(([day, list]) => (
                  <div key={day}>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                      {formatDay(list[0].kickoff)}
                    </p>
                    <div className="grid gap-3">
                      {list.map((m) => (
                        <MatchCard key={m.id} match={m} highlightId={team.id} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ) : null}
        {squad ? (
          <TabsContent value="plantilla">
            <SquadPanel squad={squad} loading={remote.isFetching} />
          </TabsContent>
        ) : null}
      </Tabs>

      <p className="text-xs text-subtle">
        <Link to="/deporte/$sport" params={{ sport: team.sport }} className="text-accent hover:underline">
          Ver todo {sportLabel[team.sport].toLowerCase()}
        </Link>
      </p>
    </div>
  );
}

function SquadPanel({ squad, loading }: { squad: TeamSquad; loading?: boolean }) {
  const groups = groupSquad(squad);
  const updated = squad.fetchedAt
    ? new Date(squad.fetchedAt).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })
    : null;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Temporada {squad.season}</p>
          <h2 className="font-display text-2xl">Plantilla</h2>
        </div>
        <a
          href={squad.source.href}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-accent hover:underline"
        >
          Fuente: {squad.source.label}
        </a>
      </div>
      <p className="text-xs text-subtle">
        {squad.note ?? "Se actualiza sola al entrar en la ficha (máximo cada 6 horas)."}
        {updated ? ` Última lectura: ${updated}.` : null}
        {loading ? " Actualizando…" : null}
      </p>
      {groups.map((g) => (
        <section key={g.pos}>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{g.label}</h3>
          <ul className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
            {g.players.map((p, i) => (
              <li
                key={`${p.num ?? "x"}-${p.name}`}
                className={cn("flex items-center gap-3 px-4 py-2.5", i > 0 && "border-t border-border")}
              >
                {p.photo ? (
                  <img src={p.photo} alt="" className="size-10 rounded-md object-cover bg-surface-2" />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-2 text-sm font-semibold tabular-nums">
                    {p.num ?? "—"}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {p.num ? <span className="mr-1.5 text-muted tabular-nums">{p.num}</span> : null}
                    {p.name}
                  </p>
                  <p className="text-xs text-muted">
                    {[p.role, p.age ? `${p.age} años` : null, p.height ? `${p.height} cm` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right text-[11px] uppercase tracking-wider text-subtle sm:block">
                  {p.pj != null ? <p>PJ {p.pj}</p> : null}
                  {p.goals != null ? <p>Goles {p.goals}</p> : null}
                  {p.assists != null ? <p>Ast {p.assists}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-border)]">
      {text}
    </div>
  );
}

function groupByDay<T extends { kickoff: string }>(items: T[]): Array<[string, T[]]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = new Date(item.kickoff).toLocaleDateString("es-ES", {
      timeZone: "Europe/Madrid",
    });
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return [...map.entries()];
}
