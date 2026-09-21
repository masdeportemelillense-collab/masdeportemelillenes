import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Star } from "lucide-react";
import { Crest } from "@/components/crest";
import { MatchCard } from "@/components/match-card";
import { SportMark } from "@/components/sport-mark";
import { teams } from "@/data/teams";
import { useFeed } from "@/lib/api/feed";
import { useFavorite, useFavoriteIds } from "@/lib/favorites";
import { SPORTS, sportLabel } from "@/lib/sports";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { live, upcoming, recent, today } = useFeed();
  const favIds = useFavoriteIds();
  const favs = teams.filter((t) => favIds.includes(t.id));
  const todayRest = today.filter((m) => m.status !== "live");
  const restUpcoming = upcoming.filter((m) => !today.some((t) => t.id === m.id)).slice(0, 6);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-surface px-5 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_80%_-10%,color-mix(in_oklab,var(--color-accent)_16%,transparent),transparent)]" />
        <div className="relative max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Temporada 2026-27 · Ciudad Autónoma</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.9] sm:text-6xl">El deporte de Melilla, en directo</h1>
          <p className="mt-4 max-w-lg text-sm text-muted sm:text-base">Marcadores oficiales en tiempo real de UD Melilla y Melilla Baloncesto, más calendario y clasificación del resto de equipos de la ciudad.</p>
          <Link to="/porra" className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-bg">Jugar a la porra</Link>
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Quiniela 1-X-2</p>
            <h2 className="mt-2 font-display text-3xl leading-none">Porra Melillense</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">Regístrate, pronostica los partidos de la jornada y suma un punto por acierto. Cierra el viernes a las 17:00 hora española.</p>
          </div>
          <Link to="/porra" className="inline-flex h-11 items-center rounded-md bg-accent/15 px-4 text-sm font-medium text-accent">Ver porra y clasificación</Link>
        </div>
      </section>

      {live.length > 0 && (<section><SectionHead title="En directo ahora" hint={`${live.length} en juego`} /><div className="grid gap-3 md:grid-cols-2">{live.map((m) => <MatchCard key={m.id} match={m} />)}</div></section>)}
      {todayRest.length > 0 && (<section><SectionHead title="Hoy" hint="Hora de Madrid" /><div className="grid gap-3 md:grid-cols-2">{todayRest.map((m) => <MatchCard key={m.id} match={m} />)}</div></section>)}
      {favs.length > 0 && (<section><SectionHead title="Tus equipos" /><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{favs.map((t) => (<Link key={t.id} to="/equipo/$slug" params={{ slug: t.id }} className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] transition-colors duration-150 hover:bg-surface-2"><Crest team={t} size={36} /><span className="min-w-0"><span className="block truncate text-sm font-medium">{t.name}</span><span className="block truncate text-xs text-muted">{t.category}</span></span></Link>))}</div></section>)}
      <section><SectionHead title="Deportes" /><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{SPORTS.map((s) => { const count = teams.filter((t) => t.sport === s.id).length; return (<Link key={s.id} to="/deporte/$sport" params={{ sport: s.id }} className="group rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] transition-colors duration-150 hover:bg-surface-2"><SportMark sport={s.id} className="size-5 text-accent" /><p className="mt-3 font-medium">{s.label}</p><p className="text-xs text-muted">{count} {count === 1 ? "equipo" : "equipos"}</p></Link>); })}</div></section>
      {restUpcoming.length > 0 && (<section><SectionHead title="Próximos partidos" /><div className="grid gap-3 md:grid-cols-2">{restUpcoming.map((m) => <MatchCard key={m.id} match={m} />)}</div></section>)}
      <section><SectionHead title="Últimos resultados" /><div className="grid gap-3 md:grid-cols-2">{recent.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} />)}</div></section>
      <section><SectionHead title="Todos los equipos" /><div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{teams.map((t) => <TeamChip key={t.id} id={t.id} />)}</div></section>
    </div>
  );
}

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (<div className="mb-4 flex items-end justify-between gap-3"><h2 className="font-display text-3xl leading-none">{title}</h2>{hint && <p className="text-xs uppercase tracking-wider text-muted">{hint}</p>}</div>);
}

function TeamChip({ id }: { id: string }) {
  const team = teams.find((t) => t.id === id)!;
  const { fav, toggle } = useFavorite(id);
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface py-2 pr-2 pl-3 shadow-[var(--shadow-border)]">
      <Link to="/equipo/$slug" params={{ slug: team.id }} className="flex min-w-0 flex-1 items-center gap-3">
        <Crest team={team} size={36} />
        <span className="min-w-0"><span className="block truncate text-sm font-medium">{team.name}</span><span className="flex items-center gap-1.5 text-xs text-muted"><SportMark sport={team.sport} className="size-3" />{sportLabel[team.sport]} · {team.category}</span></span>
        <ChevronRight className="size-4 shrink-0 text-subtle" />
      </Link>
      <button type="button" aria-label={fav ? "Quitar de favoritos" : "Añadir a favoritos"} onClick={() => toggle(id)} className="grid size-11 place-items-center rounded-md text-muted hover:text-fg"><Star className={fav ? "size-4 fill-accent text-accent" : "size-4"} /></button>
    </div>
  );
}
