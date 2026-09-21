import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  adminDeleteOverride,
  adminListOverrides,
  adminLogin,
  adminLogout,
  adminSaveOverride,
  adminSession,
} from "@/lib/admin/actions";
import { draftsToEvents, scoreFromEvents, type DraftEvent } from "@/lib/admin/apply";
import type { AdminOverride } from "@/lib/admin/types";
import { PorraAdmin } from "@/components/porra-admin";
import { useFeed } from "@/lib/api/feed";
import type { EventKind, MatchStatus, ResolvedMatch, Side } from "@/lib/types";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const session = useQuery({ queryKey: ["admin-session"], queryFn: () => adminSession() });
  if (session.isLoading) return <p className="text-sm text-muted">Comprobando acceso…</p>;
  if (!session.data?.ok) return <LoginForm onOk={() => void session.refetch()} />;
  return <Editor onLogout={() => void session.refetch()} />;
}

function LoginForm({ onOk }: { onOk: () => void }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useMutation({
    mutationFn: () => adminLogin({ data: { user, password } }),
    onSuccess: (res) => { if (res.ok) onOk(); else setError(res.error); },
  });
  return (
    <div className="mx-auto max-w-sm rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Acceso privado</p>
      <h1 className="mt-2 font-display text-4xl leading-none">Administración</h1>
      <p className="mt-2 text-sm text-muted">Cambia marcadores, horarios y carga la porra.</p>
      <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); setError(""); login.mutate(); }}>
        <label className="block text-xs uppercase tracking-wider text-muted">Usuario<input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-accent/60" /></label>
        <label className="block text-xs uppercase tracking-wider text-muted">Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-accent/60" /></label>
        {error ? <p className="text-sm text-loss">{error}</p> : null}
        <button type="submit" disabled={login.isPending} className="h-11 w-full rounded-md bg-accent text-sm font-medium text-bg disabled:opacity-60">{login.isPending ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>
  );
}

function persistLabel(kind?: string) {
  if (kind === "sql") return "Guardado permanente en la base de datos.";
  if (kind === "blobs") return "Guardado permanente en Netlify (porra y resultados).";
  return "Aviso: este entorno usa almacenamiento temporal.";
}

function PersistHint() {
  const session = useQuery({ queryKey: ["admin-session"], queryFn: () => adminSession() });
  const kind = session.data && "persist" in session.data ? session.data.persist : undefined;
  return <p className="mt-1 text-xs text-muted">{persistLabel(kind)}</p>;
}

function Editor({ onLogout }: { onLogout: () => void }) {
  const feed = useFeed();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"resultados" | "porra">("resultados");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | MatchStatus>("all");
  const overridesQ = useQuery({ queryKey: ["admin-overrides"], queryFn: () => adminListOverrides() });
  const logout = useMutation({ mutationFn: () => adminLogout(), onSuccess: () => onLogout() });
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return feed.all
      .filter((m) => (filter === "all" ? true : m.status === filter))
      .filter((m) => !term || `${m.homeName} ${m.awayName} ${m.competition ?? ""} ${m.leagueId}`.toLowerCase().includes(term))
      .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff));
  }, [feed.all, filter, q]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Panel</p>
          <h1 className="mt-1 font-display text-4xl leading-none">{tab === "porra" ? "Porra" : "Editar resultados"}</h1>
          <p className="mt-2 text-sm text-muted">{tab === "porra" ? "Publica los partidos de la quiniela y marca el 1-X-2 cuando terminen." : "Cambia marcador, horario y cronología. Se publica al momento."}</p>
          <PersistHint />
        </div>
        <button type="button" className="h-10 rounded-md bg-surface px-4 text-sm text-muted hover:text-fg" onClick={() => logout.mutate()}>Cerrar sesión</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("resultados")} className={`h-10 rounded-md px-3 text-xs uppercase tracking-wider ${tab === "resultados" ? "bg-accent text-bg" : "bg-surface text-muted"}`}>Resultados</button>
        <button type="button" onClick={() => setTab("porra")} className={`h-10 rounded-md px-3 text-xs uppercase tracking-wider ${tab === "porra" ? "bg-accent text-bg" : "bg-surface text-muted"}`}>Porra</button>
      </div>
      {tab === "porra" ? <PorraAdmin /> : null}
      {tab === "resultados" ? (
        <>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar equipo o liga" className="h-10 min-w-[12rem] flex-1 rounded-md bg-surface px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
            {(["all", "live", "scheduled", "finished"] as const).map((key) => (
              <button key={key} type="button" onClick={() => setFilter(key)} className={`h-10 rounded-md px-3 text-xs uppercase tracking-wider ${filter === key ? "bg-accent text-bg" : "bg-surface text-muted"}`}>{key === "all" ? "Todos" : key === "live" ? "Directo" : key === "scheduled" ? "Previstos" : "Finalizados"}</button>
            ))}
          </div>
          <p className="text-xs text-muted">{list.length} partidos · {overridesQ.data?.overrides.length ?? 0} cambios guardados</p>
          <div className="space-y-3">
            {list.map((match) => (
              <MatchEditor key={match.id} match={match} saved={overridesQ.data?.overrides.find((o) => o.matchId === match.id)} onSaved={() => { void qc.invalidateQueries({ queryKey: ["admin-overrides"] }); void qc.invalidateQueries({ queryKey: ["live-snapshot"] }); }} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function toDraft(events: ResolvedMatch["happened"]): DraftEvent[] {
  return events.map((ev) => ({ minute: String(ev.minute), side: ev.side, kind: ev.kind, player: ev.player }));
}

function MatchEditor({ match, saved, onSaved }: { match: ResolvedMatch; saved?: AdminOverride; onSaved: () => void }) {
  const [home, setHome] = useState(String(saved?.homeScore ?? match.homeScore));
  const [away, setAway] = useState(String(saved?.awayScore ?? match.awayScore));
  const [status, setStatus] = useState<MatchStatus>(saved?.status ?? match.status);
  const [kickoff, setKickoff] = useState((saved?.kickoff ?? match.kickoff).slice(0, 16));
  const [venue, setVenue] = useState(saved?.venue ?? match.venue);
  const [rows, setRows] = useState<DraftEvent[]>(toDraft(saved?.events?.length ? saved.events : match.happened));
  const [msg, setMsg] = useState("");
  function syncScore(next: DraftEvent[]) {
    const totals = scoreFromEvents(draftsToEvents(next));
    setHome(String(totals.home)); setAway(String(totals.away));
  }
  function patchRow(index: number, patch: Partial<DraftEvent>) {
    setRows((prev) => { const next = prev.map((row, i) => (i === index ? { ...row, ...patch } : row)); syncScore(next); return next; });
  }
  const save = useMutation({
    mutationFn: () => {
      const events = draftsToEvents(rows);
      const totals = events.length ? scoreFromEvents(events) : { home: Number(home) || 0, away: Number(away) || 0, minute: 0 };
      return adminSaveOverride({ data: { matchId: match.id, homeScore: totals.home, awayScore: totals.away, minute: totals.minute, status, kickoff: kickoff.length === 16 ? `${kickoff}:00` : kickoff, venue, events, updatedAt: Date.now() } });
    },
    onSuccess: (res) => { setMsg(res.ok ? "Guardado" : res.error || "Error"); if (res.ok) onSaved(); },
  });
  const clear = useMutation({ mutationFn: () => adminDeleteOverride({ data: { matchId: match.id } }), onSuccess: () => { setMsg("Cambio anulado"); onSaved(); } });
  return (
    <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">{match.competition || match.leagueId} · J{match.jornada || "—"} · {match.sport}</p>
          <h2 className="mt-1 text-base font-medium">{match.homeName} — {match.awayName}</h2>
        </div>
        {saved ? <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase text-accent">Editado</span> : null}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-6">
        <label className="text-xs text-muted">Local<input value={home} onChange={(e) => setHome(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm" /></label>
        <label className="text-xs text-muted">Visitante<input value={away} onChange={(e) => setAway(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm" /></label>
        <label className="text-xs text-muted">Estado<select value={status} onChange={(e) => setStatus(e.target.value as MatchStatus)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm"><option value="scheduled">Previsto</option><option value="live">En directo</option><option value="finished">Finalizado</option></select></label>
        <label className="text-xs text-muted sm:col-span-2">Fecha y hora<input type="datetime-local" value={kickoff} onChange={(e) => setKickoff(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm" /></label>
        <label className="text-xs text-muted">Pabellón<input value={venue} onChange={(e) => setVenue(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm" /></label>
      </div>
      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Cronología y goleadores</p>
          <button type="button" className="h-8 rounded-md bg-surface-2 px-3 text-xs text-fg" onClick={() => setRows((prev) => [...prev, { minute: "0", side: "home", kind: "gol", player: "" }])}>+ Añadir</button>
        </div>
        {rows.length === 0 ? <p className="mt-2 text-xs text-muted">Sin eventos. Añade goles, tarjetas o anotaciones.</p> : (
          <ul className="mt-2 space-y-2">
            {rows.map((row, i) => (
              <li key={i} className="grid gap-2 sm:grid-cols-12">
                <input value={row.minute} onChange={(e) => patchRow(i, { minute: e.target.value })} placeholder="Min" className="h-9 rounded-md bg-surface-2 px-2 text-sm sm:col-span-1" />
                <select value={row.side} onChange={(e) => patchRow(i, { side: e.target.value as Side })} className="h-9 rounded-md bg-surface-2 px-2 text-sm sm:col-span-3"><option value="home">{match.homeShort || match.homeName}</option><option value="away">{match.awayShort || match.awayName}</option></select>
                <select value={row.kind} onChange={(e) => patchRow(i, { kind: e.target.value as EventKind })} className="h-9 rounded-md bg-surface-2 px-2 text-sm sm:col-span-2"><option value="gol">Gol</option><option value="gol_pp">Gol en propia</option><option value="amarilla">Amarilla</option><option value="roja">Roja</option><option value="punto">Anotación</option><option value="set">Set</option></select>
                <input value={row.player} onChange={(e) => patchRow(i, { player: e.target.value })} placeholder="Goleador o jugador" className="h-9 rounded-md bg-surface-2 px-2 text-sm sm:col-span-5" />
                <button type="button" className="h-9 rounded-md bg-surface-2 text-xs text-muted sm:col-span-1" onClick={() => setRows((prev) => { const next = prev.filter((_, idx) => idx !== i); syncScore(next); return next; })}>Quitar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" disabled={save.isPending} onClick={() => save.mutate()} className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-bg">Guardar</button>
        {saved ? <button type="button" disabled={clear.isPending} onClick={() => clear.mutate()} className="h-9 rounded-md bg-surface-2 px-3 text-sm text-muted">Quitar cambio</button> : null}
        <Link to="/partido/$id" params={{ id: match.id }} className="text-xs text-accent hover:underline">Ver ficha</Link>
        {msg ? <span className="text-xs text-muted">{msg}</span> : null}
      </div>
    </article>
  );
}
