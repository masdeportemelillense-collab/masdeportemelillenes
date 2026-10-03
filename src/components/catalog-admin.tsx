import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { leagues } from "@/data/leagues";
import { teams as staticTeams } from "@/data/teams";
import {
  catalogDeleteMatch,
  catalogGet,
  catalogSaveMatch,
  catalogSaveTeam,
} from "@/lib/catalog/actions";
import type { CatalogTeam, MatchDraft, TeamDraft } from "@/lib/catalog/types";
import type { Gender, Sport, Team } from "@/lib/types";

const SPORTS: Sport[] = ["futbol", "baloncesto", "voleibol", "balonmano", "futsal", "bsr"];

function mergeTeams(extra: CatalogTeam[]): Team[] {
  const map = new Map<string, Team>();
  for (const t of staticTeams) map.set(t.id, t);
  for (const t of extra) {
    if (t.hidden) continue;
    const prev = map.get(t.id);
    map.set(t.id, { ...(prev ?? t), ...t, badgeUrl: t.badgeUrl || (prev as CatalogTeam | undefined)?.badgeUrl });
  }
  return [...map.values()];
}

const emptyTeam = (): TeamDraft => ({
  name: "",
  short: "",
  sport: "futbol",
  gender: "m",
  category: "Senior",
  leagueId: "tercera-g9",
  venue: "",
  founded: "2026",
  summary: "",
  nickname: "",
  badgeUrl: "",
});

const emptyMatch = (): MatchDraft => ({
  leagueId: "",
  sport: "futbol",
  venue: "",
  jornada: "1",
  kickoff: "",
  homeId: "",
  homeName: "",
  homeShort: "",
  homeBadge: "",
  awayId: "",
  awayName: "",
  awayShort: "",
  awayBadge: "",
  homeScore: "",
  awayScore: "",
  finished: false,
  suspended: false,
});

export function CatalogAdmin() {
  const qc = useQueryClient();
  const cat = useQuery({ queryKey: ["catalog"], queryFn: () => catalogGet() });
  const roster = useMemo(() => mergeTeams(cat.data?.teams ?? []), [cat.data]);
  const [team, setTeam] = useState<TeamDraft>(emptyTeam());
  const [match, setMatch] = useState<MatchDraft>(emptyMatch());
  const [msg, setMsg] = useState("");

  const saveT = useMutation({
    mutationFn: () => catalogSaveTeam({ data: team }),
    onSuccess: (res) => {
      setMsg(res.ok ? "Equipo guardado" : res.error || "Error");
      if (res.ok) {
        void qc.invalidateQueries({ queryKey: ["catalog"] });
        void qc.invalidateQueries({ queryKey: ["live-snapshot"] });
      }
    },
  });
  const saveM = useMutation({
    mutationFn: () => catalogSaveMatch({ data: match }),
    onSuccess: (res) => {
      setMsg(res.ok ? "Partido guardado" : res.error || "Error");
      if (res.ok) {
        setMatch(emptyMatch());
        void qc.invalidateQueries({ queryKey: ["catalog"] });
        void qc.invalidateQueries({ queryKey: ["live-snapshot"] });
      }
    },
  });
  const delM = useMutation({
    mutationFn: (id: string) => catalogDeleteMatch({ data: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["catalog"] });
      void qc.invalidateQueries({ queryKey: ["live-snapshot"] });
    },
  });

  function pickTeam(id: string) {
    const t = roster.find((x) => x.id === id);
    if (!t) return;
    const extra = (cat.data?.teams ?? []).find((x) => x.id === id);
    setTeam({
      id: t.id,
      name: t.name,
      short: t.short,
      sport: t.sport,
      gender: t.gender,
      category: t.category,
      leagueId: t.leagueId,
      venue: t.venue,
      founded: String(t.founded),
      summary: t.summary,
      nickname: t.nickname,
      badgeUrl: extra?.badgeUrl || "",
    });
  }

  function fillSide(side: "home" | "away", id: string) {
    const t = roster.find((x) => x.id === id);
    const extra = (cat.data?.teams ?? []).find((x) => x.id === id);
    if (!t) {
      setMatch((m) => ({ ...m, [`${side}Id`]: id }));
      return;
    }
    setMatch((m) => ({
      ...m,
      sport: t.sport,
      leagueId: m.leagueId || t.leagueId,
      venue: m.venue || t.venue,
      [`${side}Id`]: t.id,
      [`${side}Name`]: t.name,
      [`${side}Short`]: t.short,
      [`${side}Badge`]: extra?.badgeUrl || m[`${side}Badge` as const],
    }));
  }

  const field = "mt-1 h-10 w-full rounded-md bg-surface-2 px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-accent/60";

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        Desde aquí añades equipos nuevos, cambias nombre o escudo (pega la URL de la imagen) y cargas partidos.
        Se publican al momento en la web.
      </p>
      {msg ? <p className="text-sm text-accent">{msg}</p> : null}

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-2xl">Equipo y escudo</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-muted sm:col-span-2">
            Cargar uno existente
            <select className={field} value={team.id ?? ""} onChange={(e) => pickTeam(e.target.value)}>
              <option value="">— Nuevo o elige —</option>
              {roster.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.sport})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">Nombre<input className={field} value={team.name} onChange={(e) => setTeam({ ...team, name: e.target.value })} /></label>
          <label className="text-xs text-muted">Abreviatura<input className={field} value={team.short} onChange={(e) => setTeam({ ...team, short: e.target.value })} /></label>
          <label className="text-xs text-muted">Deporte
            <select className={field} value={team.sport} onChange={(e) => setTeam({ ...team, sport: e.target.value as Sport })}>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">Género
            <select className={field} value={team.gender} onChange={(e) => setTeam({ ...team, gender: e.target.value as Gender })}>
              <option value="m">Masculino</option>
              <option value="f">Femenino</option>
              <option value="mixto">Mixto</option>
            </select>
          </label>
          <label className="text-xs text-muted">Categoría<input className={field} value={team.category} onChange={(e) => setTeam({ ...team, category: e.target.value })} /></label>
          <label className="text-xs text-muted">Liga
            <select className={field} value={team.leagueId} onChange={(e) => setTeam({ ...team, leagueId: e.target.value })}>
              {leagues.map((l) => <option key={l.id} value={l.id}>{l.shortName}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">Pabellón / campo<input className={field} value={team.venue} onChange={(e) => setTeam({ ...team, venue: e.target.value })} /></label>
          <label className="text-xs text-muted">Año fundación<input className={field} value={team.founded} onChange={(e) => setTeam({ ...team, founded: e.target.value })} /></label>
          <label className="text-xs text-muted sm:col-span-2">URL del escudo<input className={field} placeholder="https://...png" value={team.badgeUrl} onChange={(e) => setTeam({ ...team, badgeUrl: e.target.value })} /></label>
          {team.badgeUrl ? <img src={team.badgeUrl} alt="" className="h-16 w-16 rounded-md bg-surface-2 object-contain" /> : null}
          <label className="text-xs text-muted sm:col-span-2">Texto de ficha<textarea className={`${field} h-20 py-2`} value={team.summary} onChange={(e) => setTeam({ ...team, summary: e.target.value })} /></label>
        </div>
        <button type="button" disabled={saveT.isPending} onClick={() => saveT.mutate()} className="mt-3 h-10 rounded-md bg-accent px-4 text-sm font-medium text-bg">
          Guardar equipo
        </button>
        <button type="button" className="ml-2 h-10 rounded-md bg-surface-2 px-4 text-sm text-muted" onClick={() => setTeam(emptyTeam())}>
          Nuevo
        </button>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-2xl">Partido</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-muted">Local (equipo web)
            <select className={field} value={match.homeId} onChange={(e) => fillSide("home", e.target.value)}>
              <option value="">— o escribe abajo —</option>
              {roster.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">Visitante (equipo web)
            <select className={field} value={match.awayId} onChange={(e) => fillSide("away", e.target.value)}>
              <option value="">— o escribe abajo —</option>
              {roster.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">Nombre local<input className={field} value={match.homeName} onChange={(e) => setMatch({ ...match, homeName: e.target.value })} /></label>
          <label className="text-xs text-muted">Nombre visitante<input className={field} value={match.awayName} onChange={(e) => setMatch({ ...match, awayName: e.target.value })} /></label>
          <label className="text-xs text-muted">Escudo local (URL)<input className={field} value={match.homeBadge} onChange={(e) => setMatch({ ...match, homeBadge: e.target.value })} /></label>
          <label className="text-xs text-muted">Escudo visitante (URL)<input className={field} value={match.awayBadge} onChange={(e) => setMatch({ ...match, awayBadge: e.target.value })} /></label>
          <label className="text-xs text-muted">Fecha y hora<input type="datetime-local" className={field} value={match.kickoff} onChange={(e) => setMatch({ ...match, kickoff: e.target.value })} /></label>
          <label className="text-xs text-muted">Pabellón<input className={field} value={match.venue} onChange={(e) => setMatch({ ...match, venue: e.target.value })} /></label>
          <label className="text-xs text-muted">Deporte
            <select className={field} value={match.sport} onChange={(e) => setMatch({ ...match, sport: e.target.value as Sport })}>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">Liga
            <select className={field} value={match.leagueId} onChange={(e) => setMatch({ ...match, leagueId: e.target.value })}>
              <option value="">—</option>
              {leagues.map((l) => <option key={l.id} value={l.id}>{l.shortName}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">Jornada<input className={field} value={match.jornada} onChange={(e) => setMatch({ ...match, jornada: e.target.value })} /></label>
          <label className="text-xs text-muted flex items-center gap-2 pt-6">
            <input type="checkbox" checked={match.finished} onChange={(e) => setMatch({ ...match, finished: e.target.checked, suspended: e.target.checked ? false : match.suspended })} />
            Ya se jugó (poner marcador)
          </label>
          <label className="text-xs text-muted flex items-center gap-2 pt-6">
            <input type="checkbox" checked={match.suspended} onChange={(e) => setMatch({ ...match, suspended: e.target.checked, finished: e.target.checked ? false : match.finished })} />
            Suspendido (no puntúa ni sale como jugado)
          </label>
          <label className="text-xs text-muted">Goles / puntos local<input className={field} value={match.homeScore} onChange={(e) => setMatch({ ...match, homeScore: e.target.value })} /></label>
          <label className="text-xs text-muted">Goles / puntos visitante<input className={field} value={match.awayScore} onChange={(e) => setMatch({ ...match, awayScore: e.target.value })} /></label>
        </div>
        <button type="button" disabled={saveM.isPending} onClick={() => saveM.mutate()} className="mt-3 h-10 rounded-md bg-accent px-4 text-sm font-medium text-bg">
          Publicar partido
        </button>
      </section>

      <section>
        <h2 className="mb-2 font-display text-2xl">Partidos creados aquí</h2>
        <ul className="space-y-2">
          {(cat.data?.matches ?? []).map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2 text-sm shadow-[var(--shadow-border)]">
              <span>
                {m.homeName} — {m.awayName}
                <span className="ml-2 text-xs text-muted">{m.kickoff.slice(0, 16).replace("T", " ")}</span>
              </span>
              <button type="button" className="text-xs text-loss" onClick={() => delM.mutate(m.id)}>Borrar</button>
            </li>
          ))}
          {(cat.data?.matches ?? []).length === 0 ? <p className="text-sm text-muted">Todavía no has publicado partidos nuevos.</p> : null}
        </ul>
      </section>
    </div>
  );
}
