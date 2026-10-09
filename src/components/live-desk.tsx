import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { adminSaveOverride } from "@/lib/admin/actions";
import {
  clockFromOverride,
  defaultPeriod,
  isBreakPeriod,
  kickoffAnchor,
  LIVE_PERIODS,
  periodBaseMinute,
  usesFootballClock,
} from "@/lib/admin/clock";
import type { AdminOverride } from "@/lib/admin/types";
import { useFeed } from "@/lib/api/feed";
import { useNow } from "@/lib/live";
import type { MatchStatus, ResolvedMatch } from "@/lib/types";

function todayKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
}

function nowMadridDay() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
}

export function LiveDesk({
  overrides,
  onSaved,
}: {
  overrides: AdminOverride[];
  onSaved: () => void;
}) {
  const feed = useFeed();
  const list = useMemo(() => {
    const day = nowMadridDay();
    return feed.all
      .filter((m) => m.status === "live" || todayKey(m.kickoff) === day)
      .sort((a, b) => {
        if (a.status === "live" && b.status !== "live") return -1;
        if (b.status === "live" && a.status !== "live") return 1;
        return Date.parse(a.kickoff) - Date.parse(b.kickoff);
      });
  }, [feed.all]);

  if (!list.length) {
    return (
      <p className="rounded-xl bg-surface p-4 text-sm text-muted shadow-[var(--shadow-border)]">
        No hay partidos de hoy. Busca el partido en Resultados, ponlo «en directo» y aquí podrás ir sumando el marcador.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Elige el periodo y, si quieres, activa el reloj. En Descanso el reloj se para.
      </p>
      {list.map((match) => (
        <LiveRow
          key={match.id}
          match={match}
          saved={overrides.find((o) => o.matchId === match.id || o.matchId === match.externalId)}
          onSaved={onSaved}
        />
      ))}
    </div>
  );
}

function LiveRow({
  match,
  saved,
  onSaved,
}: {
  match: ResolvedMatch;
  saved?: AdminOverride;
  onSaved: () => void;
}) {
  const now = useNow();
  const qc = useQueryClient();
  const home = saved?.homeScore ?? match.homeScore ?? 0;
  const away = saved?.awayScore ?? match.awayScore ?? 0;
  const status = saved?.status ?? match.status;
  const period = saved?.periodLabel || match.periodLabel || defaultPeriod(match.sport);
  const clockEnabled = Boolean(saved?.showClock);
  const canClock = usesFootballClock(match.sport);
  const onBreak = isBreakPeriod(period);
  const clock = clockFromOverride(
    {
      clockAnchorAt: saved?.clockAnchorAt,
      clockBaseMinute: saved?.clockBaseMinute,
      minute: saved?.minute ?? match.minute,
      periodLabel: period,
      showClock: clockEnabled,
    },
    now || Date.now(),
  );

  const save = useMutation({
    mutationFn: (patch: Partial<AdminOverride> & { status: MatchStatus; homeScore: number; awayScore: number }) =>
      adminSaveOverride({
        data: {
          matchId: match.id,
          venue: saved?.venue ?? match.venue,
          kickoff: saved?.kickoff ?? match.kickoff,
          events: saved?.events ?? match.happened,
          periodLabel: saved?.periodLabel ?? period,
          showClock: saved?.showClock ?? false,
          clockAnchorAt: saved?.clockAnchorAt,
          clockBaseMinute: saved?.clockBaseMinute,
          minute: patch.minute ?? saved?.minute ?? match.minute ?? 0,
          updatedAt: Date.now(),
          ...patch,
        },
      }),
    onSuccess: (res) => {
      if (res.ok) {
        onSaved();
        void qc.invalidateQueries({ queryKey: ["live-snapshot"] });
        void qc.invalidateQueries({ queryKey: ["admin-overrides"] });
      }
    },
  });

  function persist(patch: Partial<AdminOverride> & { status?: MatchStatus }) {
    const nextStatus = patch.status ?? status;
    save.mutate({
      homeScore: Math.max(0, patch.homeScore ?? home),
      awayScore: Math.max(0, patch.awayScore ?? away),
      status: nextStatus,
      ...patch,
    });
  }

  function goLive() {
    const kickoff = saved?.kickoff ?? match.kickoff;
    persist({
      status: "live",
      periodLabel: period || defaultPeriod(match.sport),
      showClock: clockEnabled,
      clockAnchorAt: clockEnabled && !isBreakPeriod(period) ? kickoffAnchor(kickoff) : undefined,
      clockBaseMinute: clockEnabled ? periodBaseMinute(period || defaultPeriod(match.sport)) : saved?.clockBaseMinute,
    });
  }

  function changePeriod(next: string) {
    if (isBreakPeriod(next)) {
      persist({
        status: status === "scheduled" ? "live" : status,
        periodLabel: next,
        minute: clock.minute,
        clockBaseMinute: clock.minute,
        clockAnchorAt: undefined,
      });
      return;
    }
    persist({
      status: status === "scheduled" ? "live" : status,
      periodLabel: next,
      clockBaseMinute: clockEnabled ? periodBaseMinute(next) : saved?.clockBaseMinute,
      clockAnchorAt: clockEnabled ? Date.now() : saved?.clockAnchorAt,
    });
  }

  function toggleClock(on: boolean) {
    const kickoff = saved?.kickoff ?? match.kickoff;
    persist({
      status: status === "scheduled" && on ? "live" : status,
      showClock: on,
      clockAnchorAt: on && !onBreak ? kickoffAnchor(kickoff) : undefined,
      clockBaseMinute: on ? (onBreak ? clock.minute : periodBaseMinute(period)) : 0,
    });
  }

  return (
    <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted">
            {match.competition || match.leagueId} · {match.sport}
            {status === "live" ? " · EN DIRECTO" : status === "finished" ? " · FINAL" : status === "suspended" ? " · SUSPENDIDO" : ""}
          </p>
          <h2 className="mt-1 text-base font-medium">
            {match.homeName} — {match.awayName}
          </h2>
        </div>
        {status === "live" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 px-2 py-0.5 text-[11px] uppercase text-live">
            <span className="pulse-live size-1.5 rounded-full bg-live" />
            {onBreak ? "Descanso" : "Directo"}
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-muted">
          Periodo
          <select
            value={LIVE_PERIODS.includes(period as (typeof LIVE_PERIODS)[number]) ? period : defaultPeriod(match.sport)}
            onChange={(e) => changePeriod(e.target.value)}
            className="mt-1 h-10 w-full rounded-md bg-surface-2 px-2 text-sm text-fg"
          >
            {LIVE_PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-md bg-surface-2 px-3 py-2">
          <label className="flex items-center gap-2 text-sm text-fg">
            <input type="checkbox" checked={clockEnabled} disabled={!canClock} onChange={(e) => toggleClock(e.target.checked)} />
            Mostrar reloj
          </label>
          {clockEnabled && canClock ? (
            <>
              <p className="mt-2 font-display text-3xl tabular-nums leading-none text-live">{status === "live" ? clock.display : "00:00"}</p>
              <p className="mt-1 text-[11px] text-muted">
                {onBreak ? "Reloj en pausa. En la web aparece Descanso." : "Arranca con la hora de inicio del partido"}
              </p>
            </>
          ) : (
            <p className="mt-1 text-[11px] text-muted">
              {canClock ? "Sin reloj: en la web solo se ve el periodo." : "Este deporte no usa minutaje de fútbol."}
            </p>
          )}
        </div>
      </div>

      {match.sport === "voleibol" ? (
        <VolleyBoard
          homeName={match.homeShort || match.homeName}
          awayName={match.awayShort || match.awayName}
          sets={saved?.setScores ?? []}
          pointHome={saved?.pointHome ?? 0}
          pointAway={saved?.pointAway ?? 0}
          disabled={save.isPending}
          onChange={(next) =>
            persist({
              status: status === "scheduled" ? "live" : status,
              homeScore: next.sets.filter((s) => s.home > s.away).length,
              awayScore: next.sets.filter((s) => s.away > s.home).length,
              setScores: next.sets,
              pointHome: next.pointHome,
              pointAway: next.pointAway,
              periodLabel: next.periodLabel,
            })
          }
        />
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <ScorePad
            label={match.homeShort || match.homeName}
            value={home}
            disabled={save.isPending}
            onMinus={() => persist({ homeScore: home - 1, awayScore: away, status: status === "scheduled" ? "live" : status })}
            onPlus={(n) => persist({ homeScore: home + n, awayScore: away, status: status === "scheduled" ? "live" : status })}
          />
          <p className="font-display text-4xl tabular-nums text-live">
            {home}
            <span className="mx-1 text-muted">–</span>
            {away}
          </p>
          <ScorePad
            label={match.awayShort || match.awayName}
            value={away}
            disabled={save.isPending}
            onMinus={() => persist({ homeScore: home, awayScore: away - 1, status: status === "scheduled" ? "live" : status })}
            onPlus={(n) => persist({ homeScore: home, awayScore: away + n, status: status === "scheduled" ? "live" : status })}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {status !== "live" ? (
          <button type="button" disabled={save.isPending} onClick={goLive} className="h-10 rounded-md bg-live px-3 text-sm font-medium text-bg">
            Poner en directo
          </button>
        ) : (
          <button type="button" disabled={save.isPending} onClick={() => persist({ status: "finished", minute: clock.minute })} className="h-10 rounded-md bg-accent px-3 text-sm font-medium text-bg">
            Finalizar partido
          </button>
        )}
        {status !== "suspended" ? (
          <button type="button" disabled={save.isPending} onClick={() => persist({ status: "suspended", showClock: false })} className="h-10 rounded-md bg-loss px-3 text-sm font-medium text-bg">
            Suspender
          </button>
        ) : null}
        {status !== "scheduled" ? (
          <button type="button" disabled={save.isPending} onClick={() => persist({ status: "scheduled", homeScore: 0, awayScore: 0, showClock: false, clockAnchorAt: undefined, clockBaseMinute: 0 })} className="h-10 rounded-md bg-surface-2 px-3 text-sm text-muted">
            Quitar directo
          </button>
        ) : null}
        {save.isPending ? <span className="self-center text-xs text-muted">Actualizando…</span> : null}
      </div>
    </article>
  );
}


const SET_LABELS = ["1er Set", "2º Set", "3er Set", "4º Set", "5º Set"];

function VolleyBoard({
  homeName,
  awayName,
  sets,
  pointHome,
  pointAway,
  disabled,
  onChange,
}: {
  homeName: string;
  awayName: string;
  sets: { home: number; away: number }[];
  pointHome: number;
  pointAway: number;
  disabled?: boolean;
  onChange: (next: { sets: { home: number; away: number }[]; pointHome: number; pointAway: number; periodLabel: string }) => void;
}) {
  const setsHome = sets.filter((s) => s.home > s.away).length;
  const setsAway = sets.filter((s) => s.away > s.home).length;
  const periodLabel = SET_LABELS[Math.min(sets.length, 4)] ?? "5º Set";
  function push(side: "home" | "away", delta: number) {
    const nextHome = Math.max(0, pointHome + (side === "home" ? delta : 0));
    const nextAway = Math.max(0, pointAway + (side === "away" ? delta : 0));
    onChange({ sets, pointHome: nextHome, pointAway: nextAway, periodLabel });
  }
  function closeSet() {
    if (pointHome === pointAway) return;
    onChange({
      sets: [...sets, { home: pointHome, away: pointAway }],
      pointHome: 0,
      pointAway: 0,
      periodLabel: SET_LABELS[Math.min(sets.length + 1, 4)] ?? "5º Set",
    });
  }
  function undoSet() {
    if (!sets.length) return;
    const last = sets[sets.length - 1];
    onChange({ sets: sets.slice(0, -1), pointHome: last.home, pointAway: last.away, periodLabel: SET_LABELS[Math.min(sets.length - 1, 4)] ?? "1er Set" });
  }
  return (
    <div className="mt-4 space-y-3">
      <p className="text-center text-xs uppercase tracking-wider text-muted">Sets {setsHome}–{setsAway} · {periodLabel}</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <p className="max-w-[8rem] truncate text-xs text-muted">{homeName}</p>
          <div className="flex gap-1">
            <button type="button" disabled={disabled || pointHome <= 0} onClick={() => push("home", -1)} className="h-10 min-w-10 rounded-md bg-surface-2 text-sm">−1</button>
            <button type="button" disabled={disabled} onClick={() => push("home", 1)} className="h-10 min-w-10 rounded-md bg-accent text-sm font-medium text-bg">+1</button>
          </div>
        </div>
        <p className="font-display text-4xl tabular-nums text-live">{pointHome}<span className="mx-1 text-muted">–</span>{pointAway}</p>
        <div className="flex flex-col items-center gap-1">
          <p className="max-w-[8rem] truncate text-xs text-muted">{awayName}</p>
          <div className="flex gap-1">
            <button type="button" disabled={disabled || pointAway <= 0} onClick={() => push("away", -1)} className="h-10 min-w-10 rounded-md bg-surface-2 text-sm">−1</button>
            <button type="button" disabled={disabled} onClick={() => push("away", 1)} className="h-10 min-w-10 rounded-md bg-accent text-sm font-medium text-bg">+1</button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" disabled={disabled || pointHome === pointAway} onClick={closeSet} className="h-9 rounded-md bg-surface-2 px-3 text-xs">Cerrar set</button>
        <button type="button" disabled={disabled || sets.length === 0} onClick={undoSet} className="h-9 rounded-md px-3 text-xs text-muted">Deshacer set</button>
      </div>
      {sets.length ? (
        <p className="text-center text-xs text-muted">Sets cerrados: {sets.map((s) => `${s.home}-${s.away}`).join(" · ")}</p>
      ) : null}
    </div>
  );
}

function ScorePad({
  label,
  value,
  onPlus,
  onMinus,
  disabled,
}: {
  label: string;
  value: number;
  onPlus: (n: number) => void;
  onMinus: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex min-w-[7.5rem] flex-col items-center gap-2">
      <p className="max-w-[9rem] truncate text-center text-xs text-muted">{label}</p>
      <div className="flex items-center gap-1">
        <button type="button" disabled={disabled || value <= 0} onClick={onMinus} className="h-10 min-w-10 rounded-md bg-surface-2 px-2 text-sm text-fg disabled:opacity-40">
          −1
        </button>
        {[1, 2, 3].map((n) => (
          <button key={n} type="button" disabled={disabled} onClick={() => onPlus(n)} className="h-10 min-w-10 rounded-md bg-accent px-2 text-sm font-medium text-bg disabled:opacity-40">
            +{n}
          </button>
        ))}
      </div>
    </div>
  );
}
