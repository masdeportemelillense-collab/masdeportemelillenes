import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  porraLogin,
  porraLogout,
  porraRegister,
  porraSavePicks,
  porraSetAvatar,
  porraState,
} from "@/lib/porra/actions";
import { porraAvatarOptions } from "@/lib/porra/avatars";
import { scoreSlate, scoreUser } from "@/lib/porra/score";
import { JornadaWinners, WinnerBanner } from "@/lib/porra/winners-ui";
import { formatMadrid, isLocked } from "@/lib/porra/time";
import type { PorraPick, PorraPublicState, PorraSlate, Quiniela } from "@/lib/porra/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/porra")({ component: PorraPage });

function PorraPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["porra-state"],
    queryFn: () => porraState(),
    staleTime: 15_000,
  });
  const state = q.data;
  const ordered = useMemo(() => {
    if (!state) return [];
    return [...state.slates].sort((a, b) => {
      const aOpen = !isLocked(a.lockAt, state.now);
      const bOpen = !isLocked(b.lockAt, state.now);
      if (aOpen !== bOpen) return aOpen ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
  }, [state]);
  function applyState(next: PorraPublicState) {
    qc.setQueryData(["porra-state"], next);
  }
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
            Si estás registrado puedes revisar tus aciertos de todas las jornadas, aunque haya pasado un mes.
          </p>
          <WinnerBanner jornadas={state.jornadas} />
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <div className="space-y-6">
          {state.user ? (
            <AccountBar user={state.user} onLogout={async () => { await porraLogout(); await qc.invalidateQueries({ queryKey: ["porra-state"] }); }} onSaved={applyState} />
          ) : (
            <AuthCard onDone={applyState} />
          )}
          {state.user ? <MyHits slates={ordered} picks={state.myPicks} userId={state.user.id} /> : null}
          {ordered.length === 0 ? (
            <p className="rounded-xl bg-surface p-5 text-sm text-muted shadow-[var(--shadow-border)]">
              Todavía no hay jornada publicada. El administrador carga los partidos desde <Link to="/admin" className="text-accent hover:underline">/admin</Link>.
            </p>
          ) : (
            ordered.map((slate) => (
              <SlateCard key={`${slate.id}-${state.user?.id ?? "anon"}`} slate={slate} now={state.now} user={state.user} picks={state.myPicks.filter((p) => p.slateId === slate.id)} onSaved={applyState} />
            ))
          )}
        </div>
        <aside className="space-y-3">
          <h2 className="font-display text-3xl leading-none">Clasificación general</h2>
          <p className="text-xs text-muted">Suma de aciertos de todas las jornadas publicadas.</p>
          <Leaderboard board={state.board} me={state.user?.id} />
          <JornadaWinners jornadas={state.jornadas} me={state.user?.id} />
        </aside>
      </div>
    </div>
  );
}

function AvatarMark({ teamId, size = 28 }: { teamId?: string; size?: number }) {
  const opt = porraAvatarOptions().find((t) => t.id === teamId);
  if (opt?.src) {
    return <img src={opt.src} alt="" width={size} height={size} className="shrink-0 rounded-md bg-surface-2 object-contain p-0.5" />;
  }
  return <span className="flex shrink-0 items-center justify-center rounded-md bg-surface-2 text-[10px] font-semibold" style={{ width: size, height: size }}>?</span>;
}

function AvatarPicker({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  const options = useMemo(() => porraAvatarOptions(), []);
  return (
    <div className="sm:col-span-2">
      <p className="mb-2 text-xs uppercase tracking-wider text-muted">Escudo / avatar</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
        {options.map((t) => (
          <button key={t.id} type="button" title={t.name} onClick={() => onChange(t.id)} className={cn("flex flex-col items-center gap-1 rounded-lg p-1.5 ring-1", value === t.id ? "bg-accent/15 ring-accent" : "bg-surface-2 ring-border hover:ring-accent/50")}>
            {t.src ? <img src={t.src} alt="" className="size-8 object-contain" /> : <span className="flex size-8 items-center justify-center text-[9px] font-semibold">{t.short}</span>}
            <span className="w-full truncate text-center text-[9px] leading-tight text-muted">{t.short}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AccountBar({ user, onLogout, onSaved }: { user: NonNullable<PorraPublicState["user"]>; onLogout: () => void; onSaved: (state: PorraPublicState) => void }) {
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const save = useMutation({
    mutationFn: () => porraSetAvatar({ data: { avatar } }),
    onSuccess: (res) => { if (res.ok) { onSaved(res.state); setOpen(false); } },
  });
  return (
    <div className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-sm font-medium text-accent">Ya estás registrado.</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <AvatarMark teamId={user.avatar} size={32} />
          <p className="truncate text-sm text-muted">Juegas como <span className="font-medium text-fg">{user.name}</span></p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs uppercase tracking-wider text-accent hover:underline">Cambiar escudo</button>
          <button type="button" onClick={onLogout} className="text-xs uppercase tracking-wider text-muted hover:text-fg">Salir</button>
        </div>
      </div>
      {open ? (
        <div className="mt-3 space-y-3">
          <AvatarPicker value={avatar} onChange={setAvatar} />
          <button type="button" disabled={save.isPending || !avatar} onClick={() => save.mutate()} className="h-10 w-full rounded-md bg-accent text-sm font-medium text-bg disabled:opacity-60">{save.isPending ? "Guardando…" : "Guardar escudo"}</button>
        </div>
      ) : null}
    </div>
  );
}

function MyHits({ slates, picks, userId }: { slates: PorraSlate[]; picks: PorraPick[]; userId: string }) {
  const total = scoreUser(userId, slates, picks);
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-3xl leading-none">Tus aciertos</h2>
          <p className="mt-1 text-sm text-muted">Todas las jornadas publicadas, también las de hace semanas o meses.</p>
        </div>
        <p className="text-sm font-medium text-accent">{total.correct} acierto{total.correct === 1 ? "" : "s"} · {total.points} pts</p>
      </div>
      {slates.length === 0 ? <p className="mt-3 text-sm text-muted">Aún no hay jornadas para consultar.</p> : (
        <ul className="mt-4 divide-y divide-border">
          {slates.map((slate) => {
            const row = scoreSlate(userId, slate, picks);
            return (
              <li key={slate.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div>
                  <p className="text-sm font-medium">{slate.title}</p>
                  <p className="text-xs text-muted">{row.resolved ? `${row.resolved} resueltos` : "Pendiente de resultados"} · {slate.matches.length} partidos</p>
                </div>
                <p className="text-sm tabular-nums">{row.resolved ? <span className="font-medium text-accent">{row.correct}/{row.resolved}</span> : <span className="text-muted">—</span>}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function AuthCard({ onDone }: { onDone: (state: PorraPublicState) => void }) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const act = useMutation({
    mutationFn: () => mode === "register" ? porraRegister({ data: { name, password, avatar } }) : porraLogin({ data: { name, password } }),
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
        {mode === "register" ? <AvatarPicker value={avatar} onChange={setAvatar} /> : null}
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
  useEffect(() => {
    setDraft((prev) => {
      const fromServer = Object.fromEntries(picks.map((p) => [p.matchId, p.pick]));
      if (!Object.keys(fromServer).length) return prev;
      if (!Object.keys(prev).length) return fromServer;
      const next = { ...fromServer };
      for (const [id, pick] of Object.entries(prev)) next[id] = pick;
      return next;
    });
  }, [picks]);
  const save = useMutation({
    mutationFn: () => porraSavePicks({ data: { slateId: slate.id, picks: Object.entries(draft).map(([matchId, pick]) => ({ matchId, pick })) } }),
    onSuccess: (res) => { if (res.ok) { onSaved(res.state); setMsg("Pronóstico guardado."); } else setMsg(res.error); },
  });
  const filled = slate.matches.filter((m) => draft[m.id]).length;
  const mine = user ? scoreSlate(user.id, slate, picks) : null;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-3xl leading-none">{slate.title}</h2>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted">{locked ? "Cerrada" : "Abierta"} · cierra {formatMadrid(slate.lockAt)}</p>
        </div>
        <div className="text-right">
          {mine && mine.resolved ? <p className="text-sm font-medium text-accent">{mine.correct}/{mine.resolved} aciertos</p> : null}
          <p className="text-xs text-muted">{filled}/{slate.matches.length} pronosticados</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {slate.matches.map((m) => {
          const pick = draft[m.id];
          const ok = m.result && pick ? pick === m.result : null;
          return (
            <div key={m.id} className="grid items-center gap-2 rounded-xl bg-surface-2 px-3 py-3 sm:grid-cols-[1fr_auto] sm:px-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.home} <span className="text-muted">–</span> {m.away}</p>
                {m.result ? (
                  <p className={cn("mt-1 text-xs", ok === true ? "text-accent" : ok === false ? "text-loss" : "text-muted")}>
                    Resultado {m.result}{pick ? ` · tu ${pick}` : " · sin pronóstico"}{ok === true ? " · acierto +1" : ok === false ? " · fallado" : ""}
                  </p>
                ) : pick ? <p className="mt-1 text-xs text-muted">Tu pronóstico: {pick}</p> : null}
              </div>
              <PickTriple value={pick} disabled={!user || locked} allowDraw={m.allowDraw !== false} onChange={(next) => setDraft((prev) => ({ ...prev, [m.id]: next }))} />
            </div>
          );
        })}
      </div>
      {user && !locked ? <button type="button" disabled={save.isPending || filled === 0} onClick={() => { setMsg(""); save.mutate(); }} className="mt-4 h-11 w-full rounded-md bg-accent text-sm font-medium text-bg disabled:opacity-60">{save.isPending ? "Guardando…" : "Guardar pronósticos"}</button> : null}
      {!user ? <p className="mt-3 text-xs text-muted">Regístrate arriba para enviar tu 1-X-2.</p> : null}
      {locked && user ? <p className="mt-3 text-xs text-muted">Jornada cerrada. Puedes consultar tus aciertos, pero ya no se cambian los pronósticos.</p> : null}
      {msg ? <p className="mt-2 text-sm text-muted">{msg}</p> : null}
    </section>
  );
}

function PickTriple({ value, disabled, onChange, allowDraw = true }: { value?: Quiniela; disabled?: boolean; allowDraw?: boolean; onChange: (pick: Quiniela) => void }) {
  const keys = (allowDraw ? ["1", "X", "2"] : ["1", "2"]) as Quiniela[];
  return (
    <div className="flex gap-1">
      {keys.map((key) => (
        <button key={key} type="button" disabled={disabled} onClick={() => onChange(key)} className={cn("h-10 w-10 rounded-md text-sm font-semibold tabular-nums", value === key ? "bg-accent text-bg" : "bg-surface text-fg ring-1 ring-border", disabled && "opacity-60")}>{key}</button>
      ))}
    </div>
  );
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
              <td className={cn("px-2 py-2", me === row.userId && "font-medium text-accent")}>
                <span className="inline-flex items-center gap-2">
                  <AvatarMark teamId={row.avatar} size={22} />
                  {row.name}
                </span>
              </td>
              <td className="px-3 py-2 text-right font-medium tabular-nums">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
