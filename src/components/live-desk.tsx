import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { adminSaveOverride } from "@/lib/admin/actions";
import {
  clockFromOverride,
  defaultPeriod,
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
        Elige el periodo, pon el partido en directo y pulsa +1 / −1. En fútbol el reloj arranca con la hora de inicio.
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
  const showClock = usesFootballClock(match.sport);
  const clock = clockFromOverride(
    {
      clockAnchorAt: saved?.clockAnchorAt,
      clockBaseMinute: saved?.clockBaseMinute,
      minute: saved?.minute ?? match.minute,
      periodLabel: period,
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
      clockAnchorAt: kickoffAnchor(kickoff),
      clockBaseMinute: periodBaseMinute(period || defaultPeriod(match.sport)),
    });
  }

  function changePeriod(next: string) {
    persist({
      status: status === "scheduled" ? "live" : status,
      periodLabel: next,
      clockBaseMinute: periodBaseMinute(next),
      clockAnchorAt: Date.now(),
    });
  }

  return (
    <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted">
            {match.competition || match.leagueId} · {match.sport}
            {status === "live" ? " · EN DIRECTO" : status === "finished" ? " · FINAL" : ""}
          </p>
          <h2 className="mt-1 text-base font-medium">
            {match.homeName} — {match.awayName}
          </h2>
        </div>
        {status === "live" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 px-2 py-0.5 text-[11px] uppercase text-live">
            <span className="pulse-live size-1.5 rounded-full bg-live" />
            Directo
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
        {showClock ? (
          <div className="rounded-md bg-surface-2 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wider text-muted">Reloj</p>
            <p className="font-display text-3xl tabular-nums leading-none text-live">{status === "live" ? clock.display : "00:00"}</p>
            <p className="mt-1 text-[11px] text-muted">Arranca con la hora de inicio del partido</p>
          </div>
        ) : (
          <div className="rounded-md bg-surface-2 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wider text-muted">Periodo en web</p>
            <p className="mt-1 text-sm text-fg">{period}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <ScorePad
          label={match.homeShort || match.homeName}
          value={home}
          disabled={save.isPending}
          onMinus={() => persist({ homeScore: home - 1, awayScore: away, status: status === "scheduled" ? "live" : status })}
          onPlus={() => persist({ homeScore: home + 1, awayScore: away, status: status === "scheduled" ? "live" : status })}
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
          onPlus={() => persist({ homeScore: home, awayScore: away + 1, status: status === "scheduled" ? "live" : status })}
        />
      </div>

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
        {status !== "scheduled" ? (
          <button type="button" disabled={save.isPending} onClick={() => persist({ status: "scheduled", homeScore: 0, awayScore: 0, clockAnchorAt: undefined, clockBaseMinute: 0 })} className="h-10 rounded-md bg-surface-2 px-3 text-sm text-muted">
            Quitar directo
          </button>
        ) : null}
        {save.isPending ? <span className="self-center text-xs text-muted">Actualizando…</span> : null}
      </div>
    </article>
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
  onPlus: () => void;
  onMinus: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex min-w-[7.5rem] flex-col items-center gap-2">
      <p className="max-w-[9rem] truncate text-center text-xs text-muted">{label}</p>
      <div className="flex items-center gap-2">
        <button type="button" disabled={disabled || value <= 0} onClick={onMinus} className="size-10 rounded-md bg-surface-2 text-lg text-fg disabled:opacity-40">
          −1
        </button>
        <button type="button" disabled={disabled} onClick={onPlus} className="size-10 rounded-md bg-accent text-lg font-medium text-bg disabled:opacity-40">
          +1
        </button>
      </div>
    </div>
  );
}
