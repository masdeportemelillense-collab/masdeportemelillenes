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
import type { AdminOverride } from "@/lib/admin/types";
import { useFeed } from "@/lib/api/feed";
import type { MatchStatus, ResolvedMatch } from "@/lib/types";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const session = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => adminSession(),
  });

  if (session.isLoading) {
    return <p className="text-sm text-muted">Comprobando acceso…</p>;
  }
  if (!session.data?.ok) return <LoginForm onOk={() => void session.refetch()} />;
  return <Editor onLogout={() => void session.refetch()} />;
}

function LoginForm({ onOk }: { onOk: () => void }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useMutation({
    mutationFn: () => adminLogin({ data: { user, password } }),
    onSuccess: (res) => {
      if (res.ok) onOk();
      else setError(res.error);
    },
  });

  return (
    <div className="mx-auto max-w-sm rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Acceso privado</p>
      <h1 className="mt-2 font-display text-4xl leading-none">Administración</h1>
      <p className="mt-2 text-sm text-muted">Cambia marcadores, horarios y estado de cualquier partido.</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          login.mutate();
        }}
      >
        <label className="block text-xs uppercase tracking-wider text-muted">
          Usuario
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-accent/60"
          />
        </label>
        <label className="block text-xs uppercase tracking-wider text-muted">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-accent/60"
          />
        </label>
        {error ? <p className="text-sm text-loss">{error}</p> : null}
        <button
          type="submit"
          disabled={login.isPending}
          className="h-11 w-full rounded-md bg-accent text-sm font-medium text-bg disabled:opacity-60"
        >
          {login.isPending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

function Editor({ onLogout }: { onLogout: () => void }) {
  const feed = useFeed();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | MatchStatus>("all");
  const overridesQ = useQuery({
    queryKey: ["admin-overrides"],
    queryFn: () => adminListOverrides(),
  });
  const logout = useMutation({
    mutationFn: () => adminLogout(),
    onSuccess: () => onLogout(),
  });

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return feed.all
      .filter((m) => (filter === "all" ? true : m.status === filter))
      .filter((m) => {
        if (!term) return true;
        return `${m.homeName} ${m.awayName} ${m.competition ?? ""} ${m.leagueId}`.toLowerCase().includes(term);
      })
      .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff));
  }, [feed.all, filter, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Panel</p>
          <h1 className="mt-1 font-display text-4xl leading-none">Editar resultados</h1>
          <p className="mt-2 text-sm text-muted">
            Los cambios se publican al momento y sustituyen al calendario y a Solo-FutSal.
          </p>
        </div>
        <button
          type="button"
          className="h-10 rounded-md bg-surface px-4 text-sm text-muted hover:text-fg"
          onClick={() => logout.mutate()}
        >
          Cerrar sesión
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar equipo o liga"
          className="h-10 min-w-[12rem] flex-1 rounded-md bg-surface px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60"
        />
        {(["all", "live", "scheduled", "finished"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`h-10 rounded-md px-3 text-xs uppercase tracking-wider ${
              filter === key ? "bg-accent text-bg" : "bg-surface text-muted"
            }`}
          >
            {key === "all" ? "Todos" : key === "live" ? "Directo" : key === "scheduled" ? "Previstos" : "Finalizados"}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted">
        {list.length} partidos · {overridesQ.data?.overrides.length ?? 0} cambios guardados
      </p>

      <div className="space-y-3">
        {list.map((match) => (
          <MatchEditor
            key={match.id}
            match={match}
            saved={overridesQ.data?.overrides.find((o) => o.matchId === match.id)}
            onSaved={() => {
              void qc.invalidateQueries({ queryKey: ["admin-overrides"] });
              void qc.invalidateQueries({ queryKey: ["live-snapshot"] });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MatchEditor({
  match,
  saved,
  onSaved,
}: {
  match: ResolvedMatch;
  saved?: AdminOverride;
  onSaved: () => void;
}) {
  const [home, setHome] = useState(String(saved?.homeScore ?? match.homeScore));
  const [away, setAway] = useState(String(saved?.awayScore ?? match.awayScore));
  const [status, setStatus] = useState<MatchStatus>(saved?.status ?? match.status);
  const [kickoff, setKickoff] = useState((saved?.kickoff ?? match.kickoff).slice(0, 16));
  const [venue, setVenue] = useState(saved?.venue ?? match.venue);
  const [msg, setMsg] = useState("");

  const save = useMutation({
    mutationFn: () =>
      adminSaveOverride({
        data: {
          matchId: match.id,
          homeScore: Number(home) || 0,
          awayScore: Number(away) || 0,
          status,
          kickoff: kickoff.length === 16 ? `${kickoff}:00` : kickoff,
          venue,
          updatedAt: Date.now(),
        },
      }),
    onSuccess: (res) => {
      setMsg(res.ok ? "Guardado" : res.error || "Error");
      if (res.ok) onSaved();
    },
  });
  const clear = useMutation({
    mutationFn: () => adminDeleteOverride({ data: { matchId: match.id } }),
    onSuccess: () => {
      setMsg("Cambio anulado");
      onSaved();
    },
  });

  return (
    <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">
            {match.competition || match.leagueId} · J{match.jornada || "—"} · {match.sport}
          </p>
          <h2 className="mt-1 text-base font-medium">
            {match.homeName} — {match.awayName}
          </h2>
          <p className="text-xs text-muted">{match.id}</p>
        </div>
        {saved ? <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase text-accent">Editado</span> : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-6">
        <label className="text-xs text-muted">
          Local
          <input value={home} onChange={(e) => setHome(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm" />
        </label>
        <label className="text-xs text-muted">
          Visitante
          <input value={away} onChange={(e) => setAway(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm" />
        </label>
        <label className="text-xs text-muted">
          Estado
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MatchStatus)}
            className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm"
          >
            <option value="scheduled">Previsto</option>
            <option value="live">En directo</option>
            <option value="finished">Finalizado</option>
          </select>
        </label>
        <label className="text-xs text-muted sm:col-span-2">
          Fecha y hora
          <input
            type="datetime-local"
            value={kickoff}
            onChange={(e) => setKickoff(e.target.value)}
            className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm"
          />
        </label>
        <label className="text-xs text-muted">
          Pabellón
          <input value={venue} onChange={(e) => setVenue(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm" />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate()}
          className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-bg"
        >
          Guardar
        </button>
        {saved ? (
          <button
            type="button"
            disabled={clear.isPending}
            onClick={() => clear.mutate()}
            className="h-9 rounded-md bg-surface-2 px-3 text-sm text-muted"
          >
            Quitar cambio
          </button>
        ) : null}
        <Link to="/partido/$id" params={{ id: match.id }} className="text-xs text-accent hover:underline">
          Ver ficha
        </Link>
        {msg ? <span className="text-xs text-muted">{msg}</span> : null}
      </div>
    </article>
  );
}
