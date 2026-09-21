import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  porraLogin,
  porraLogout,
  porraRegister,
  porraSavePicks,
  porraState,
} from "@/lib/porra/actions";
import { formatMadrid, isLocked } from "@/lib/porra/time";
import type { PorraPick, PorraPublicState, PorraSlate, Quiniela } from "@/lib/porra/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/porra")({ component: PorraPage });

function PorraPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["porra-state"], queryFn: () => porraState() });
  const state = q.data;
  if (q.isLoading || !state) return <p className="text-sm text-muted">Cargando la porra…</p>;
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-surface px-5 py-8 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_80%_-10%,color-mix(in_oklab,var(--color-accent)_16%,transparent),transparent)]" />
        <div className="relative">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Juego · Quiniela 1-X-2</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.9] sm:text-6xl">Porra Melillense</h1>
          <p className="mt-4 max-w-xl text-sm text-muted sm:text-base">
            Pronostica los partidos que publique el administrador. Cada acierto suma 1 punto.
            Los pronósticos se cierran el <strong className="text-fg">viernes a las 17:00</strong> (hora española).
            Hay que registrarse para participar.
          </p>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <div className="space-y-6">
          {state.user ? (
            <AccountBar name={state.user.name} onLogout={async () => { await porraLogout(); await qc.invalidateQueries({ queryKey: ["porra-state"] }); }} />
          ) : (
            <AuthCard onDone={(next) => qc.setQueryData(["porra-state"], next)} />
          )}
          {state.slates.length === 0 ? (
            <p className="rounded-xl bg-surface p-5 text-sm text-muted shadow-[var(--shadow-border)]">
              Todavía no hay jornada publicada. El administrador carga los partidos desde <Link to="/admin" className="text-accent hover:underline">/admin</Link>.
            </p>
          ) : (
            state.slates.map((slate) => (
              <SlateCard key={slate.id} slate={slate} now={state.now} user={state.user} picks={state.myPicks.filter((p) => p.slateId === slate.id)} onSaved={(next) => qc.setQueryData(["porra-state"], next)} />
            ))
          )}
        </div>
        <aside className="space-y-3">
          <h2 className="font-display text-3xl leading-none">Clasificación</h2>
          <Leaderboard board={state.board} me={state.user?.id} />
        </aside>
      </div>
    </div>
  );
}

function AccountBar({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-sm">Juegas como <span className="font-medium text-accent">{name}</span></p>
      <button type="button" onClick={onLogout} className="text-xs uppercase tracking-wider text-muted hover:text-fg">Salir</button>
    </div>
  );
}

function AuthCard({ onDone }: { onDone: (state: PorraPublicState) => void }) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const act = useMutation({
    mutationFn: () => mode === "register" ? porraRegister({ data: { name, password } }) : porraLogin({ data: { name, password } }),
    onSuccess: (res) => { if (res.ok) onDone(res.state); else setError(res.error); },
  });
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <div className="mb-4 flex gap-2">
        <button type="button" onClick={() => setMode("register")} className={cn("h-9 rounded-md px-3 text-xs uppercase tracking-wider", mode === "register" ? "bg-accent text-bg" : "bg-surface-2 text-muted")}>Registrarse</button>
        <button type="button" onClick={() => setMode("login")} className={cn("h-9 rounded-md px-3 text-xs uppercase tracking-wider", mode === "login" ? "bg-accent text-bg" : "bg-surface-2 text-muted")}>Entrar</button>
      </div>
      <p className="text-sm text-muted">{mode === "register" ? "Crea un alias para aparecer en la clasificación." : "Entra con el alias que usaste al registrarte."}</p>
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setError(""); act.mutate(); }}>
        <label className="block text-xs uppercase tracking-wider text-muted">Alias<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-accent/60" /></label>
        <label className="block text-xs uppercase tracking-wider text-muted">Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-accent/60" /></label>
        {error ? <p className="text-sm text-loss sm:col-span-2">{error}</p> : null}
        <button type="submit" disabled={act.isPending} className="h-11 rounded-md bg-accent text-sm font-medium text-bg disabled:opacity-60 sm:col-span-2">{act.isPending ? "Enviando…" : mode === "register" ? "Crear cuenta y jugar" : "Entrar a la porra"}</button>
      </form>
    </div>
  );
}

function SlateCard({ slate, now, user, picks, onSaved }: { slate: PorraSlate; now: number; user: PorraPublicState["user"]; picks: PorraPick[]; onSaved: (state: PorraPublicState) => void }) {
  const locked = isLocked(slate.lockAt, now);
  const [draft, setDraft] = useState<Record<string, Quiniela>>(() => Object.fromEntries(picks.map((p) => [p.matchId, p.pick])));
  const [msg, setMsg] = useState("");
  const save = useMutation({
    mutationFn: () => porraSavePicks({ data: { slateId: slate.id, picks: Object.entries(draft).map(([matchId, pick]) => ({ matchId, pick })) } }),
    onSuccess: (res) => { if (res.ok) { onSaved(res.state); setMsg("Pronóstico guardado."); } else setMsg(res.error); },
  });
  const filled = slate.matches.filter((m) => draft[m.id]).length;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-3xl leading-none">{slate.title}</h2>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted">{locked ? "Cerrada" : "Abierta"} · cierra {formatMadrid(slate.lockAt)}</p>
        </div>
        <p className="text-xs text-muted">{filled}/{slate.matches.length} pronosticados</p>
      </div>
      <div className="mt-4 space-y-2">
        {slate.matches.map((m) => (
          <div key={m.id} className="grid items-center gap-2 rounded-xl bg-surface-2 px-3 py-3 sm:grid-cols-[1fr_auto] sm:px-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{m.home} <span className="text-muted">–</span> {m.away}</p>
              {m.result ? <p className="mt-1 text-xs text-accent">Resultado: {labelPick(m.result)}{draft[m.id] ? (draft[m.id] === m.result ? " · acierto +1" : " · fallado") : " · sin pronóstico"}</p> : null}
            </div>
            <PickTriple value={draft[m.id]} disabled={!user || locked} onChange={(pick) => setDraft((prev) => ({ ...prev, [m.id]: pick }))} />
          </div>
        ))}
      </div>
      {user && !locked ? <button type="button" disabled={save.isPending || filled === 0} onClick={() => { setMsg(""); save.mutate(); }} className="mt-4 h-11 w-full rounded-md bg-accent text-sm font-medium text-bg disabled:opacity-60">{save.isPending ? "Guardando…" : "Guardar pronósticos"}</button> : null}
      {!user ? <p className="mt-3 text-xs text-muted">Regístrate arriba para enviar tu 1-X-2.</p> : null}
      {locked && user ? <p className="mt-3 text-xs text-muted">Jornada cerrada. Ya no se pueden cambiar los pronósticos.</p> : null}
      {msg ? <p className="mt-2 text-sm text-muted">{msg}</p> : null}
    </section>
  );
}

function PickTriple({ value, disabled, onChange }: { value?: Quiniela; disabled?: boolean; onChange: (pick: Quiniela) => void }) {
  return (
    <div className="flex gap-1">
      {(["1", "X", "2"] as const).map((key) => (
        <button key={key} type="button" disabled={disabled} onClick={() => onChange(key)} className={cn("h-10 w-10 rounded-md text-sm font-semibold tabular-nums", value === key ? "bg-accent text-bg" : "bg-surface text-fg ring-1 ring-border", disabled && "opacity-60")}>{key}</button>
      ))}
    </div>
  );
}

function labelPick(p: Quiniela): string {
  if (p === "1") return "1 (local)";
  if (p === "2") return "2 (visitante)";
  return "X (empate)";
}

function Leaderboard({ board, me }: { board: PorraPublicState["board"]; me?: string }) {
  const rows = useMemo(() => board, [board]);
  if (!rows.length) return <p className="rounded-xl bg-surface p-4 text-sm text-muted shadow-[var(--shadow-border)]">Aún no hay jugadores. Sé el primero.</p>;
  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted"><th className="px-3 py-2 font-medium">#</th><th className="px-2 py-2 font-medium">Jugador</th><th className="px-3 py-2 text-right font-medium">Pts</th></tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.userId} className={cn("border-b border-border last:border-0", me === row.userId && "bg-accent/10")}>
              <td className="px-3 py-2 tabular-nums text-muted">{i + 1}</td>
              <td className={cn("px-2 py-2", me === row.userId && "font-medium text-accent")}>{row.name}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
