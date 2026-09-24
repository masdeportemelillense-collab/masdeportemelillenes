import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
  const q = useQuery({ queryKey: ["porra-state"], queryFn: () => porraState() });
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
            <AccountBar user={state.user} onLogout={async () => { await porraLogout(); await qc.invalidateQueries({ queryKey: ["porra-state"] }); }} onSaved={(next) => qc.setQueryData(["porra-state"], next)} />
          ) : (
            <AuthCard onDone={(next) => qc.setQueryData(["porra-state"], next)} />
          )}
          {state.user ? <MyHits slates={ordered} picks={state.myPicks} userId={state.user.id} /> : null}
          {ordered.length === 0 ? (
            <p className="rounded-xl bg-surface p-5 text-sm text-muted shadow-[var(--shadow-border)]">
              Todavía no hay jornada publicada. El administrador carga los partidos desde <Link to="/admin" className="text-accent hover:underline">/admin</Link>.
            </p>
          ) : (
            ordered.map((slate) => (
              <SlateCard key={slate.id} slate={slate} now={state.now} user={state.user} picks={state.myPicks.filter((p) => p.slateId === slate.id)} onSaved={(next) => qc.setQueryData(["porra-state"], next)} />
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
