import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminSession } from "@/lib/admin/actions";
import { getGroup9 } from "@/lib/api/group9";
import { adminSetGroup9Score } from "@/lib/group9/actions";

export function Group9Board({ jornada }: { jornada?: number }) {
  const q = useQuery({
    queryKey: ["group9", jornada || 0],
    queryFn: () => getGroup9({ data: { jornada } }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const session = useQuery({ queryKey: ["admin-session"], queryFn: () => adminSession(), staleTime: 30_000 });
  const data = q.data;
  if (!data?.matches.length) return null;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-3xl leading-none">Jornada {data.jornada || jornada || ""} · Grupo 9</h2>
      <p className="mt-1 text-xs text-muted">Resultados de esta jornada en Tercera Federación, desde Futbolme.</p>
      <ul className="mt-3 divide-y divide-border">
        {data.matches.map((m) => (
          <li key={`${m.home}-${m.away}`} className="py-2">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[13px] sm:text-sm">
              <span className="text-right leading-tight [overflow-wrap:anywhere]">{m.home}</span>
              <span className={m.played ? "font-semibold tabular-nums text-fg" : "tabular-nums text-muted"}>{m.score}</span>
              <span className="leading-tight [overflow-wrap:anywhere]">{m.away}</span>
            </div>
            {session.data?.ok ? (
              <ScoreEdit jornada={data.jornada} home={m.home} away={m.away} current={m.played ? m.score : ""} />
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ScoreEdit({ jornada, home, away, current }: { jornada: number; home: string; away: string; current: string }) {
  const qc = useQueryClient();
  const [score, setScore] = useState(current);
  const [msg, setMsg] = useState("");
  const save = useMutation({
    mutationFn: () => adminSetGroup9Score({ data: { jornada, home, away, score } }),
    onSuccess: (res) => {
      setMsg(res.ok ? "Resultado guardado." : res.error);
      if (res.ok) void qc.invalidateQueries({ queryKey: ["group9"] });
    },
  });
  return (
    <form
      className="mt-1 flex items-center justify-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg("");
        save.mutate();
      }}
    >
      <input value={score} onChange={(e) => setScore(e.target.value)} placeholder="2-1" className="h-8 w-16 rounded-md bg-surface-2 px-2 text-center text-xs outline-none ring-1 ring-border" />
      <button type="submit" disabled={save.isPending} className="h-8 rounded-md bg-accent px-2 text-[11px] font-medium text-bg disabled:opacity-60">
        {save.isPending ? "…" : "Editar"}
      </button>
      {msg ? <span className="text-[11px] text-muted">{msg}</span> : null}
    </form>
  );
}
