import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { porraAvatarOptions } from "@/lib/porra/avatars";
import {
  superAnnounce,
  superChat,
  superCreateLeague,
  superGenerate,
  superJoinLeague,
  superKick,
  superLogin,
  superLogout,
  superRegister,
  superSavePicks,
  superSelectMatches,
  superSetAvatar,
  superSetResult,
  superState,
  superUpdateLeague,
} from "@/lib/superporra/actions";
import { scoreMatch } from "@/lib/superporra/score";
import type { SportKind, SuperPublic } from "@/lib/superporra/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/superporra")({
  component: SuperPage,
});

function logoutAndReset(qc: ReturnType<typeof useQueryClient>, setLeagueId: (id?: string) => void) {
  return async () => {
    await superLogout();
    setLeagueId(undefined);
    await qc.invalidateQueries({ queryKey: ["superporra"] });
  };
}

function SuperPage() {
  const qc = useQueryClient();
  const [leagueId, setLeagueId] = useState<string | undefined>();
  const q = useQuery({
    queryKey: ["superporra", leagueId ?? ""],
    queryFn: () => superState({ data: { leagueId } }),
    staleTime: 8_000,
    refetchInterval: 20_000,
  });
  const state = q.data;
  function apply(next: SuperPublic) {
    qc.setQueryData(["superporra", next.league?.id ?? leagueId ?? ""], next);
    if (!next.league) qc.setQueryData(["superporra", ""], next);
    if (next.league && next.league.id !== leagueId) setLeagueId(next.league.id);
  }
  if (q.isLoading || !state) return <p className="text-sm text-muted">Cargando la Superporra…</p>;
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-surface px-5 py-7 sm:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Prueba · resultado exacto</p>
        <h1 className="mt-2 font-display text-5xl leading-[0.9]">Superporra Melillense</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Ligas privadas de resultado exacto. El enlace está abajo a propósito mientras se prueba.
        </p>
        {state.user ? (
          <button type="button" onClick={logoutAndReset(qc, setLeagueId)} className="mt-4 h-9 rounded-md bg-surface-2 px-3 text-xs uppercase tracking-wider text-muted hover:text-accent">Cerrar sesión</button>
        ) : null}
      </section>
      {state.isWebAdmin ? <MasterPanel state={state} onOpen={setLeagueId} /> : null}
      {state.league ? <LeagueView state={state} onBack={() => setLeagueId(undefined)} onSaved={apply} /> : !state.user ? <Auth onDone={apply} /> : <Hub state={state} onOpen={setLeagueId} onSaved={apply} />}
    </div>
  );
}

function Auth({ onDone }: { onDone: (s: SuperPublic) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const options = useMemo(() => porraAvatarOptions(), []);
  const chosen = url.trim() || avatar;
  const register = useMutation({
    mutationFn: () => superRegister({ data: { name, password, avatar: chosen } }),
    onSuccess: (res) => { if (res.ok && res.state.user) onDone(res.state); else setError(res.ok ? "No se pudo iniciar la sesión." : res.error); },
  });
  const login = useMutation({
    mutationFn: () => superLogin({ data: { name, password } }),
    onSuccess: (res) => { if (res.ok) onDone(res.state); else setError(res.error); },
  });
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("login")} className={cn("h-9 rounded-md px-3 text-xs uppercase tracking-wider", mode === "login" ? "bg-accent text-bg" : "bg-surface-2 text-muted")}>Entrar</button>
        <button type="button" onClick={() => setMode("register")} className={cn("h-9 rounded-md px-3 text-xs uppercase tracking-wider", mode === "register" ? "bg-accent text-bg" : "bg-surface-2 text-muted")}>Registrarse</button>
      </div>
      <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); setError(""); (mode === "login" ? login : register).mutate(); }}>
        <label className="block text-xs uppercase tracking-wider text-muted">Usuario<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" /></label>
        <label className="block text-xs uppercase tracking-wider text-muted">Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" /></label>
        {mode === "register" ? (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">Escudo</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {options.map((o) => (
                <button key={o.id} type="button" onClick={() => { setAvatar(o.id); setUrl(""); }} className={cn("shrink-0 rounded-lg p-1 ring-1", avatar === o.id && !url ? "ring-accent" : "ring-border")} title={o.name}>
                  {o.src ? <img src={o.src} alt="" className="size-10 object-contain" /> : <span className="grid size-10 place-items-center text-[10px]">{o.short}</span>}
                </button>
              ))}
            </div>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="o pega un enlace de escudo" className="mt-2 h-10 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" />
          </div>
        ) : null}
        {error ? <p className="text-sm text-loss">{error}</p> : null}
        <button type="submit" className="h-11 rounded-md bg-accent px-4 text-sm font-medium text-bg">{mode === "login" ? "Entrar" : "Crear cuenta"}</button>
      </form>
    </section>
  );
}

function Hub({ state, onOpen, onSaved }: { state: SuperPublic; onOpen: (id: string) => void; onSaved: (s: SuperPublic) => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [max, setMax] = useState(10);
  const [error, setError] = useState("");
  const [url, setUrl] = useState(state.user?.avatar?.startsWith("http") ? state.user.avatar : "");
  const options = useMemo(() => porraAvatarOptions(), []);
  const create = useMutation({ mutationFn: () => superCreateLeague({ data: { name, password, max } }), onSuccess: (res) => { if (res.ok) onSaved(res.state); else setError(res.error); } });
  const join = useMutation({ mutationFn: () => superJoinLeague({ data: { name, password } }), onSuccess: (res) => { if (res.ok) onSaved(res.state); else setError(res.error); } });
  const avatar = useMutation({ mutationFn: (next: string) => superSetAvatar({ data: { avatar: next } }), onSuccess: (res) => { if (res.ok) onSaved(res.state); } });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">Hola, {state.user?.name}</h2>
          <button type="button" onClick={logoutAndReset(qc, () => undefined)} className="text-xs text-muted hover:text-accent">Cerrar sesión</button>
        </div>
        <p className="mt-1 text-xs text-muted">Escudo de perfil</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {options.map((o) => (
            <button key={o.id} type="button" onClick={() => avatar.mutate(o.id)} className={cn("shrink-0 rounded-lg p-1 ring-1", state.user?.avatar === o.id ? "ring-accent" : "ring-border")}>
              {o.src ? <img src={o.src} alt="" className="size-9 object-contain" /> : <span className="grid size-9 place-items-center text-[10px]">{o.short}</span>}
            </button>
          ))}
        </div>
        <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); avatar.mutate(url); }}>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="enlace externo de escudo" className="h-10 flex-1 rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" />
          <button className="h-10 rounded-md bg-surface-2 px-3 text-xs">Usar</button>
        </form>
        <h3 className="mt-5 font-display text-2xl">Tus ligas</h3>
        <ul className="mt-2 space-y-2">
          {state.leagues.length ? state.leagues.map((l) => (
            <li key={l.id}><button type="button" onClick={() => onOpen(l.id)} className="flex w-full items-center justify-between rounded-xl bg-surface-2 px-3 py-2 text-left text-sm"><span>{l.name}</span><span className="text-xs text-muted">{l.participants}/{l.max}</span></button></li>
          )) : <li className="text-sm text-muted">Todavía no estás en ninguna liga.</li>}
        </ul>
      </section>
      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-3xl">Crear o unirse</h2>
        <form className="mt-3 space-y-2" onSubmit={(e) => { e.preventDefault(); setError(""); create.mutate(); }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la liga" className="h-11 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña de la liga" className="h-11 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" />
          <label className="block text-xs text-muted">Participantes máx.<input type="number" min={2} max={32} value={max} onChange={(e) => setMax(Number(e.target.value))} className="mt-1 h-10 w-24 rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" /></label>
          <div className="flex gap-2">
            <button type="submit" className="h-10 rounded-md bg-accent px-3 text-sm text-bg">Crear liga</button>
            <button type="button" onClick={() => { setError(""); join.mutate(); }} className="h-10 rounded-md bg-surface-2 px-3 text-sm">Unirse</button>
          </div>
          {error ? <p className="text-sm text-loss">{error}</p> : null}
        </form>
      </section>
    </div>
  );
}

function LeagueView({ state, onBack, onSaved }: { state: SuperPublic; onBack: () => void; onSaved: (s: SuperPublic) => void }) {
  const league = state.league!;
  const [tab, setTab] = useState<"picks" | "cal" | "table" | "chat" | "admin">("picks");
  const manage = state.isOwner || state.isWebAdmin;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <button type="button" onClick={onBack} className="text-xs text-muted hover:text-accent">← Ligas</button>
          <h2 className="font-display text-4xl leading-none">{league.name}</h2>
          <p className="mt-1 text-xs text-muted">{league.participants.length}/{league.maxParticipants} participantes · admin {league.ownerName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["picks", "cal", "table", "chat"] as const).map((key) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={cn("h-9 rounded-md px-3 text-xs uppercase tracking-wider", tab === key ? "bg-accent text-bg" : "bg-surface text-muted")}>{key === "picks" ? "Pronósticos" : key === "cal" ? "Calendario" : key === "table" ? "Clasificación" : "Chat"}</button>
          ))}
          {manage ? <button type="button" onClick={() => setTab("admin")} className={cn("h-9 rounded-md px-3 text-xs uppercase tracking-wider", tab === "admin" ? "bg-accent text-bg" : "bg-surface text-muted")}>Admin</button> : null}
        </div>
      </div>
      {tab === "picks" ? <Picks state={state} onSaved={onSaved} /> : null}
      {tab === "cal" ? <Calendar state={state} /> : null}
      {tab === "table" ? <Table state={state} /> : null}
      {tab === "chat" ? <Chat state={state} onSaved={onSaved} /> : null}
      {tab === "admin" && manage ? <Admin state={state} onSaved={onSaved} /> : null}
    </div>
  );
}

function Picks({ state, onSaved }: { state: SuperPublic; onSaved: (s: SuperPublic) => void }) {
  const jornada = state.jornadas.at(-1);
  const [draft, setDraft] = useState<Record<string, { home: string; away: string }>>({});
  const [msg, setMsg] = useState("");
  const [historyId, setHistoryId] = useState(state.jornadas.at(-1)?.id ?? "");
  const save = useMutation({
    mutationFn: () => superSavePicks({
      data: {
        leagueId: state.league!.id,
        jornadaId: jornada!.id,
        picks: Object.entries(draft).filter(([, v]) => v.home !== "" && v.away !== "").map(([matchId, v]) => ({ matchId, home: Number(v.home), away: Number(v.away) })),
      },
    }),
    onSuccess: (res) => {
      if (res.ok) {
        setMsg("Pronóstico registrado.");
        onSaved(res.state);
      } else setMsg(res.error);
    },
  });
  if (!jornada) return <p className="rounded-xl bg-surface p-4 text-sm text-muted">El administrador todavía no ha elegido los 10 partidos de esta jornada.</p>;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <h3 className="font-display text-3xl">Jornada {jornada.number}{jornada.autoFilled ? " · automática" : ""}</h3>
      <ul className="mt-3 space-y-2">
        {jornada.matches.map((m) => {
          const saved = state.picks.find((p) => p.matchId === m.id);
          const value = draft[m.id] ?? { home: saved ? String(saved.home) : "", away: saved ? String(saved.away) : "" };
          return (
            <li key={m.id} className="grid items-center gap-2 rounded-xl bg-surface-2 p-3 sm:grid-cols-[1fr_auto_1fr]">
              <span className="text-right text-sm">{m.home}</span>
              <span className="flex items-center justify-center gap-1">
                <input value={value.home} onChange={(e) => setDraft((d) => ({ ...d, [m.id]: { ...value, home: e.target.value } }))} className="h-9 w-12 rounded-md bg-surface text-center text-sm outline-none ring-1 ring-border" />
                <span className="text-muted">-</span>
                <input value={value.away} onChange={(e) => setDraft((d) => ({ ...d, [m.id]: { ...value, away: e.target.value } }))} className="h-9 w-12 rounded-md bg-surface text-center text-sm outline-none ring-1 ring-border" />
              </span>
              <span className="text-sm">{m.away}{m.officialHome != null ? <span className="ml-2 text-xs text-muted">oficial {m.officialHome}-{m.officialAway}</span> : null}</span>
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={() => { setMsg(""); save.mutate(); }} className="mt-3 h-10 rounded-md bg-accent px-3 text-sm text-bg">{save.isPending ? "Guardando…" : "Guardar pronósticos"}</button>
      {msg ? <p className="mt-2 text-sm text-accent">{msg}</p> : null}
      {(state.isOwner || state.isWebAdmin) && jornada ? <p className="mt-2 text-xs text-muted">Pronósticos hechos: {state.predictionCount}/{state.predictionTotal}</p> : null}
      <History state={state} selected={historyId} onSelect={setHistoryId} />
    </section>
  );
}

function History({ state, selected, onSelect }: { state: SuperPublic; selected: string; onSelect: (id: string) => void }) {
  const jornada = state.jornadas.find((j) => j.id === selected) ?? state.jornadas.at(-1);
  if (!jornada) return null;
  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-display text-2xl">Tus aciertos</h4>
        <select value={jornada.id} onChange={(e) => onSelect(e.target.value)} className="h-9 rounded-md bg-surface-2 px-2 text-xs">
          {state.jornadas.map((j) => <option key={j.id} value={j.id}>Jornada {j.number}</option>)}
        </select>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {jornada.matches.map((m) => {
          const pick = state.picks.find((p) => p.jornadaId === jornada.id && p.matchId === m.id);
          const pts = pick ? scoreMatch(m.sport, pick.home, pick.away, m.officialHome, m.officialAway) : 0;
          const done = m.officialHome != null;
          return (
            <li key={m.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <span className="min-w-0">{m.home} – {m.away}</span>
              <span className="shrink-0 text-xs text-muted">{pick ? `${pick.home}-${pick.away}` : "sin pronóstico"}{done ? ` · oficial ${m.officialHome}-${m.officialAway}` : ""}</span>
              <span className={done ? (pts ? "text-win" : "text-loss") : "text-muted"}>{done ? (pts ? `+${pts}` : "fallo") : "pendiente"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Calendar({ state }: { state: SuperPublic }) {
  const [open, setOpen] = useState<string | null>(null);
  const rounds = [...new Set(state.fixtures.map((f) => f.round))].sort((a, b) => a - b);
  if (!rounds.length) return <p className="rounded-xl bg-surface p-4 text-sm text-muted">El administrador todavía no ha generado el calendario.</p>;
  return (
    <div className="space-y-3">
      {rounds.map((round) => (
        <section key={round} className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <h3 className="font-display text-2xl">Jornada {round}</h3>
          <ul className="mt-2 divide-y divide-border">
            {state.fixtures.filter((f) => f.round === round).map((f) => (
              <li key={f.id} className="py-2 text-sm">
                <button type="button" disabled={!f.resolved} onClick={() => setOpen(open === f.id ? null : f.id)} className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 disabled:cursor-default">
                  <span className="text-right">{f.homeName}</span>
                  <span className="tabular-nums text-muted">{f.resolved ? `${f.homePoints}-${f.awayPoints}` : "–"}</span>
                  <span className="text-left">{f.awayName}</span>
                </button>
                {open === f.id ? <Breakdown state={state} round={round} homeId={f.homeUserId} awayId={f.awayUserId} homeName={f.homeName} awayName={f.awayName} /> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Breakdown({ state, round, homeId, awayId, homeName, awayName }: { state: SuperPublic; round: number; homeId: string; awayId: string; homeName: string; awayName: string }) {
  const jornada = state.jornadas.find((j) => j.number === round);
  if (!jornada) return null;
  const pickOf = (userId: string, matchId: string) => [...state.picks, ...state.rivalPicks].find((p) => p.userId === userId && p.jornadaId === jornada.id && p.matchId === matchId);
  return (
    <ul className="mt-2 space-y-1 rounded-xl bg-surface-2 p-3 text-xs">
      {jornada.matches.map((m) => {
        const home = pickOf(homeId, m.id);
        const away = pickOf(awayId, m.id);
        const hp = home ? scoreMatch(m.sport, home.home, home.away, m.officialHome, m.officialAway) : 0;
        const ap = away ? scoreMatch(m.sport, away.home, away.away, m.officialHome, m.officialAway) : 0;
        return (
          <li key={m.id} className="grid gap-1 border-b border-border py-2 last:border-0 sm:grid-cols-[1.2fr_1fr_1fr]">
            <span>{m.home} {m.officialHome ?? "–"}-{m.officialAway ?? "–"} {m.away}</span>
            <span>{homeName}: {home ? `${home.home}-${home.away}` : "—"} · {hp} pts</span>
            <span>{awayName}: {away ? `${away.home}-${away.away}` : "—"} · {ap} pts</span>
          </li>
        );
      })}
    </ul>
  );
}

function Table({ state }: { state: SuperPublic }) {
  return (
    <section className="overflow-x-auto rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted"><tr><th className="py-2">Jugador</th><th>J</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>Pts</th></tr></thead>
        <tbody>
          {state.board.map((row, i) => (
            <tr key={row.userId} className={cn("border-t border-border", row.userId === state.user?.id && "text-accent")}>
              <td className="py-2">{i + 1}. {row.name}</td><td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td><td>{row.gf}</td><td>{row.gc}</td><td className="font-medium">{row.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Chat({ state, onSaved }: { state: SuperPublic; onSaved: (s: SuperPublic) => void }) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const send = useMutation({ mutationFn: () => superChat({ data: { leagueId: state.league!.id, text } }), onSuccess: (res) => { if (res.ok) { setText(""); onSaved(res.state); } } });
  const announce = useMutation({ mutationFn: () => superAnnounce({ data: { leagueId: state.league!.id, text: note } }), onSuccess: (res) => { if (res.ok) { setNote(""); onSaved(res.state); } } });
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      {state.announcements.length ? (
        <ul className="mb-3 space-y-2">{state.announcements.map((a) => <li key={a.id} className="rounded-xl bg-accent/10 px-3 py-2 text-sm">{a.text}</li>)}</ul>
      ) : null}
      <ul className="max-h-80 space-y-2 overflow-y-auto">
        {state.chat.map((m) => <li key={m.id} className="text-sm"><span className="font-medium">{m.name}: </span>{m.text}</li>)}
      </ul>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send.mutate(); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Mensaje para la liga" className="h-10 flex-1 rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" />
        <button className="h-10 rounded-md bg-accent px-3 text-sm text-bg">Enviar</button>
      </form>
      {state.isOwner || state.isWebAdmin ? (
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); announce.mutate(); }}>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tablón de anuncios" className="h-10 flex-1 rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" />
          <button className="h-10 rounded-md bg-surface-2 px-3 text-sm">Anunciar</button>
        </form>
      ) : null}
    </section>
  );
}

function Admin({ state, onSaved }: { state: SuperPublic; onSaved: (s: SuperPublic) => void }) {
  const league = state.league!;
  const [name, setName] = useState(league.name);
  const [password, setPassword] = useState(league.password);
  const [max, setMax] = useState(league.maxParticipants);
  const [season, setSeason] = useState(league.seasonStart ?? "");
  const [open, setOpen] = useState(league.jornadaOpen ?? "");
  const [close, setClose] = useState(league.jornadaClose ?? "");
  const [slateId, setSlateId] = useState(state.slates[0]?.id ?? "");
  const [picked, setPicked] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const slate = state.slates.find((s) => s.id === slateId);
  const save = useMutation({ mutationFn: () => superUpdateLeague({ data: { leagueId: league.id, name, password, max, seasonStart: season, jornadaOpen: open, jornadaClose: close } }), onSuccess: (res) => { setMsg(res.ok ? "Liga guardada." : res.error); if (res.ok) onSaved(res.state); } });
  const gen = useMutation({ mutationFn: () => superGenerate({ data: { leagueId: league.id } }), onSuccess: (res) => { setMsg(res.ok ? "Calendario generado." : res.error); if (res.ok) onSaved(res.state); } });
  const select = useMutation({ mutationFn: () => superSelectMatches({ data: { leagueId: league.id, slateId, matchIds: picked } }), onSuccess: (res) => { setMsg(res.ok ? "Partidos publicados." : res.error); if (res.ok) onSaved(res.state); } });
  const result = useMutation({ mutationFn: (d: { jornadaId: string; matchId: string; home: number; away: number; sport: SportKind }) => superSetResult({ data: { leagueId: league.id, ...d } }), onSuccess: (res) => { if (res.ok) onSaved(res.state); } });
  const kick = useMutation({ mutationFn: (userId: string) => superKick({ data: { leagueId: league.id, userId } }), onSuccess: (res) => { if (res.ok) onSaved(res.state); } });
  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h3 className="font-display text-3xl">Control de la liga</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" />
          <label className="text-xs text-muted">Máximo<input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" /></label>
          <label className="text-xs text-muted">Inicio de temporada<input type="date" value={season} onChange={(e) => setSeason(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" /></label>
          <label className="text-xs text-muted">Inicio de jornada<input type="datetime-local" value={open} onChange={(e) => setOpen(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" /></label>
          <label className="text-xs text-muted">Cierre de jornada<input type="datetime-local" value={close} onChange={(e) => setClose(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border" /></label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => save.mutate()} className="h-10 rounded-md bg-accent px-3 text-sm text-bg">Guardar</button>
          <button type="button" onClick={() => gen.mutate()} disabled={league.started} className="h-10 rounded-md bg-surface-2 px-3 text-sm disabled:opacity-40">{league.started ? "Calendario generado" : "Generar calendario"}</button>
        </div>
        {msg ? <p className="mt-2 text-xs text-muted">{msg}</p> : null}
        <ul className="mt-3 space-y-1 text-sm">
          {league.participants.map((id) => {
            const row = state.board.find((b) => b.userId === id);
            return <li key={id} className="flex items-center justify-between"><span>{row?.name ?? id}</span>{id !== league.ownerId ? <button type="button" onClick={() => kick.mutate(id)} className="text-xs text-loss">Expulsar</button> : <span className="text-xs text-muted">Admin</span>}</li>;
          })}
        </ul>
      </section>
      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h3 className="font-display text-3xl">Elegir 10 partidos</h3>
        <p className="mt-1 text-xs text-muted">Salen de la porra publicada. Si pasan 24 horas sin elegir, se cogen solos.</p>
        <select value={slateId} onChange={(e) => { setSlateId(e.target.value); setPicked([]); }} className="mt-2 h-10 rounded-md bg-surface-2 px-2 text-sm">
          {state.slates.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <ul className="mt-2 space-y-1">
          {slate?.matches.map((m) => (
            <li key={m.id}><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={picked.includes(m.id)} onChange={(e) => setPicked((ids) => e.target.checked ? [...ids, m.id].slice(0, 10) : ids.filter((id) => id !== m.id))} />{m.home} – {m.away}</label></li>
          ))}
        </ul>
        <button type="button" onClick={() => select.mutate()} className="mt-3 h-10 rounded-md bg-accent px-3 text-sm text-bg">Publicar {picked.length} partidos</button>
      </section>
      {state.jornadas.map((j) => (
        <section key={j.id} className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <h3 className="font-display text-2xl">Resultados jornada {j.number}</h3>
          {j.id === state.jornadas.at(-1)?.id ? <p className="mt-1 text-xs text-muted">Han pronosticado {state.predictionCount} de {state.predictionTotal}</p> : null}
          <ul className="mt-2 space-y-2">
            {j.matches.map((m) => <ResultRow key={m.id} match={m} onSave={(home, away, sport) => result.mutate({ jornadaId: j.id, matchId: m.id, home, away, sport })} />)}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ResultRow({ match, onSave }: { match: { id: string; home: string; away: string; sport: SportKind; officialHome?: number; officialAway?: number }; onSave: (home: number, away: number, sport: SportKind) => void }) {
  const [home, setHome] = useState(match.officialHome != null ? String(match.officialHome) : "");
  const [away, setAway] = useState(match.officialAway != null ? String(match.officialAway) : "");
  const [sport, setSport] = useState<SportKind>(match.sport);
  return (
    <li className="grid items-center gap-2 sm:grid-cols-[1fr_auto_auto]">
      <span className="text-sm">{match.home} – {match.away}</span>
      <select value={sport} onChange={(e) => setSport(e.target.value as SportKind)} className="h-9 rounded-md bg-surface-2 px-2 text-xs">
        <option value="futbol">Fútbol</option><option value="baloncesto">Baloncesto</option><option value="balonmano">Balonmano</option><option value="voleibol">Voleibol</option>
      </select>
      <span className="flex gap-1">
        <input value={home} onChange={(e) => setHome(e.target.value)} className="h-9 w-12 rounded-md bg-surface-2 text-center text-sm outline-none ring-1 ring-border" />
        <input value={away} onChange={(e) => setAway(e.target.value)} className="h-9 w-12 rounded-md bg-surface-2 text-center text-sm outline-none ring-1 ring-border" />
        <button type="button" onClick={() => onSave(Number(home), Number(away), sport)} className="h-9 rounded-md bg-surface px-2 text-xs">Ok</button>
      </span>
    </li>
  );
}

function MasterPanel({ state, onOpen }: { state: SuperPublic; onOpen: (id: string) => void }) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-3xl">Administración de la web</h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Usuarios</p>
          <ul className="mt-1 space-y-1 text-sm">{state.accounts?.map((u) => <li key={u.id}>{u.name} · {u.password ?? "—"}</li>)}</ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Ligas</p>
          <ul className="mt-1 space-y-1 text-sm">{state.allLeagues?.map((l) => <li key={l.id}><button type="button" onClick={() => onOpen(l.id)} className="hover:text-accent">{l.name}</button> · {l.password} · {l.owner}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
