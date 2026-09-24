import { useMemo, useState } from "react";
import { porraAvatarOptions } from "./avatars";
import type { PorraJornadaSummary, PorraPublicState } from "./types";
import { cn } from "@/lib/utils";

function Mark({ teamId, size = 28 }: { teamId?: string; size?: number }) {
  const opt = porraAvatarOptions().find((t) => t.id === teamId);
  if (opt?.src) {
    return <img src={opt.src} alt="" width={size} height={size} className="shrink-0 rounded-md bg-surface-2 object-contain p-0.5" />;
  }
  return <span className="flex shrink-0 items-center justify-center rounded-md bg-surface-2 text-[10px] font-semibold" style={{ width: size, height: size }}>?</span>;
}

export function WinnerBanner({ jornadas }: { jornadas?: PorraJornadaSummary[] }) {
  const last = (jornadas ?? []).find((j) => j.finished);
  if (!last || !last.winners.length) return null;
  const pts = last.winners[0].points;
  return (
    <div className="mt-5 rounded-xl bg-accent/10 px-4 py-3 ring-1 ring-accent/30">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">Última jornada cerrada · {last.title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {last.winners.map((w) => (
          <span key={w.userId} className="inline-flex items-center gap-2 text-sm font-medium">
            <Mark teamId={w.avatar} size={28} />
            <span>{w.name}</span>
            <span className="tabular-nums text-accent">{w.points} pts</span>
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs text-muted">{last.winners.length > 1 ? `Empate a ${pts} puntos.` : "Ganador de la jornada."}</p>
    </div>
  );
}

export function JornadaWinners({ jornadas, me }: { jornadas?: PorraJornadaSummary[]; me?: string }) {
  const list = jornadas ?? [];
  const [id, setId] = useState(list.find((j) => j.finished)?.slateId || list[0]?.slateId || "");
  const current = list.find((j) => j.slateId === id) || list[0];
  if (!list.length) return null;
  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">Ganador por jornada</p>
      <select value={current?.slateId || ""} onChange={(e) => setId(e.target.value)} className="mt-2 h-10 w-full rounded-md bg-surface-2 px-2 text-sm outline-none ring-1 ring-border">
        {list.map((j) => (
          <option key={j.slateId} value={j.slateId}>{j.title}{j.finished ? "" : " · en curso"}</option>
        ))}
      </select>
      {!current ? null : !current.finished ? (
        <p className="mt-3 text-sm text-muted">Esta jornada aún no está cerrada. Faltan resultados.</p>
      ) : current.winners.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Sin pronósticos en esta jornada.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {current.winners.map((w) => (
            <li key={w.userId} className={cn("flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-2 py-2", me === w.userId && "ring-1 ring-accent")}>
              <span className="inline-flex min-w-0 items-center gap-2">
                <Mark teamId={w.avatar} size={24} />
                <span className="truncate text-sm font-medium">{w.name}</span>
              </span>
              <span className="text-sm tabular-nums text-accent">{w.points} pts</span>
            </li>
          ))}
        </ul>
      )}
      {current?.finished && current.board.length ? (
        <ul className="mt-3 divide-y divide-border">
          {current.board.slice(0, 12).map((row, i) => (
            <li key={row.userId} className={cn("flex items-center justify-between gap-2 py-1.5 text-sm", me === row.userId && "text-accent")}>
              <span className="inline-flex min-w-0 items-center gap-2">
                <span className="w-4 tabular-nums text-muted">{i + 1}</span>
                <Mark teamId={row.avatar} size={18} />
                <span className="truncate">{row.name}</span>
              </span>
              <span className="tabular-nums">{row.points}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function useJornadas(state?: PorraPublicState | null) {
  return useMemo(() => state?.jornadas ?? [], [state]);
}
