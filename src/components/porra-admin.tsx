import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { porraAdminDeleteSlate, porraAdminList, porraAdminSaveSlate } from "@/lib/porra/actions";
import { nextFridayLockIso } from "@/lib/porra/time";
import type { PorraSlate, Quiniela } from "@/lib/porra/types";

type DraftMatch = { id?: string; home: string; away: string; kickoff: string; result: "" | Quiniela };
const emptyMatch = (): DraftMatch => ({ home: "", away: "", kickoff: "", result: "" });

export function PorraAdmin() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["porra-admin"], queryFn: () => porraAdminList() });
  const [title, setTitle] = useState("");
  const [lockAt, setLockAt] = useState(nextFridayLockIso());
  const [editing, setEditing] = useState<string | null>(null);
  const [matches, setMatches] = useState<DraftMatch[]>([emptyMatch(), emptyMatch()]);
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: () =>
      porraAdminSaveSlate({
        data: {
          id: editing ?? undefined,
          title,
          lockAt,
          published: true,
          matches: matches.map((m) => ({ id: m.id, home: m.home, away: m.away, kickoff: m.kickoff || undefined, result: m.result || null })),
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) { setError(res.error); return; }
      setError(""); setEditing(null); setTitle(""); setLockAt(nextFridayLockIso()); setMatches([emptyMatch(), emptyMatch()]);
      void qc.invalidateQueries({ queryKey: ["porra-admin"] });
      void qc.invalidateQueries({ queryKey: ["porra-state"] });
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => porraAdminDeleteSlate({ data: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["porra-admin"] });
      void qc.invalidateQueries({ queryKey: ["porra-state"] });
    },
  });

  function load(slate: PorraSlate) {
    setEditing(slate.id);
    setTitle(slate.title);
    setLockAt(slate.lockAt);
    setMatches(slate.matches.map((m) => ({ id: m.id, home: m.home, away: m.away, kickoff: m.kickoff ?? "", result: m.result ?? "" })));
    setError("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl leading-none">{editing ? "Editar jornada" : "Nueva jornada"}</h2>
        <p className="mt-1 text-sm text-muted">Añade los partidos a pronosticar. El cierre por defecto es el viernes a las 17:00 (hora española). Cuando terminen, marca el 1, X o 2 para puntuar.</p>
      </div>
      <div className="space-y-3 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <label className="block text-xs uppercase tracking-wider text-muted">Nombre de la jornada<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Jornada 4 · Tercera Federación" className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" /></label>
        <label className="block text-xs uppercase tracking-wider text-muted">Cierre de pronósticos<input value={lockAt} onChange={(e) => setLockAt(e.target.value)} className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" /></label>
        <div className="space-y-2">
          {matches.map((m, i) => (
            <div key={m.id ?? i} className="grid gap-2 rounded-xl bg-surface-2 p-3 sm:grid-cols-[1fr_1fr_auto_auto]">
              <input value={m.home} onChange={(e) => setMatches((rows) => rows.map((r, j) => (j === i ? { ...r, home: e.target.value } : r)))} placeholder="Local" className="h-10 rounded-md bg-surface px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
              <input value={m.away} onChange={(e) => setMatches((rows) => rows.map((r, j) => (j === i ? { ...r, away: e.target.value } : r)))} placeholder="Visitante" className="h-10 rounded-md bg-surface px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
              <div className="flex gap-1">
                {(["1", "X", "2"] as const).map((key) => (
                  <button key={key} type="button" onClick={() => setMatches((rows) => rows.map((r, j) => (j === i ? { ...r, result: r.result === key ? "" : key } : r)))} className={`h-10 w-9 rounded-md text-sm font-semibold ${m.result === key ? "bg-accent text-bg" : "bg-surface ring-1 ring-border"}`}>{key}</button>
                ))}
              </div>
              <button type="button" onClick={() => setMatches((rows) => rows.filter((_, j) => j !== i))} className="h-10 rounded-md px-3 text-xs text-muted hover:text-loss">Quitar</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setMatches((rows) => [...rows, emptyMatch()])} className="h-10 rounded-md bg-surface-2 px-3 text-sm text-muted hover:text-fg">+ Añadir partido</button>
        {error ? <p className="text-sm text-loss">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={save.isPending} onClick={() => save.mutate()} className="h-11 rounded-md bg-accent px-5 text-sm font-medium text-bg disabled:opacity-60">{save.isPending ? "Guardando…" : editing ? "Actualizar jornada" : "Publicar jornada"}</button>
          {editing ? <button type="button" onClick={() => { setEditing(null); setTitle(""); setMatches([emptyMatch(), emptyMatch()]); }} className="h-11 rounded-md px-4 text-sm text-muted">Cancelar</button> : null}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-muted">Jornadas publicadas</h3>
        {(list.data?.slates ?? []).map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-muted">{s.matches.length} partidos · cierra {s.lockAt}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => load(s)} className="h-9 rounded-md bg-surface-2 px-3 text-xs">Editar / resultados</button>
              <button type="button" onClick={() => del.mutate(s.id)} className="h-9 rounded-md px-3 text-xs text-loss">Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
