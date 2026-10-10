import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminSession } from "@/lib/admin/actions";
import { adminSetBadge, adminSetName } from "@/lib/badges/actions";
import type { ResolvedMatch } from "@/lib/types";

export function AdminBadgeEditor({ match }: { match: ResolvedMatch }) {
  const session = useQuery({ queryKey: ["admin-session"], queryFn: () => adminSession(), staleTime: 30_000 });
  if (!session.data?.ok) return null;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-3xl leading-none">Equipos · administración</h2>
      <p className="mt-1 text-xs text-muted">Solo lo ves tú. Cambia el nombre o pega el escudo. Vale para el equipo melillense y para el rival, y se aplica en todos sus partidos.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <TeamField teamId={match.homeId} name={match.homeName} badge={match.homeBadge} />
        <TeamField teamId={match.awayId} name={match.awayName} badge={match.awayBadge} />
      </div>
    </section>
  );
}

function TeamField({ teamId, name, badge }: { teamId?: string; name: string; badge?: string }) {
  const qc = useQueryClient();
  const [nextName, setNextName] = useState(name);
  const [url, setUrl] = useState(badge ?? "");
  const [msg, setMsg] = useState("");
  const refresh = () => void qc.invalidateQueries({ queryKey: ["live-snapshot"] });
  const saveName = useMutation({
    mutationFn: () => adminSetName({ data: { teamId, originalName: name, name: nextName } }),
    onSuccess: (res) => {
      setMsg(res.ok ? "Nombre guardado." : res.error);
      if (res.ok) refresh();
    },
  });
  const saveBadge = useMutation({
    mutationFn: () => adminSetBadge({ data: { teamId, name: nextName || name, badgeUrl: url } }),
    onSuccess: (res) => {
      setMsg(res.ok ? "Escudo guardado." : res.error);
      if (res.ok) refresh();
    },
  });
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <label className="block text-xs uppercase tracking-wider text-muted">
        Nombre
        <input value={nextName} onChange={(e) => setNextName(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
      </label>
      <button type="button" disabled={saveName.isPending} onClick={() => saveName.mutate()} className="mt-2 h-9 rounded-md bg-accent px-3 text-xs font-medium text-bg disabled:opacity-60">
        {saveName.isPending ? "Guardando…" : "Guardar nombre"}
      </button>
      <label className="mt-3 block text-xs uppercase tracking-wider text-muted">
        Escudo
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/escudo.png" className="mt-1 h-10 w-full rounded-md bg-surface px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
      </label>
      <button type="button" disabled={saveBadge.isPending} onClick={() => saveBadge.mutate()} className="mt-2 h-9 rounded-md bg-surface px-3 text-xs font-medium text-fg disabled:opacity-60">
        {saveBadge.isPending ? "Guardando…" : "Guardar escudo"}
      </button>
      {msg ? <p className="mt-1 text-xs text-muted">{msg}</p> : null}
    </div>
  );
}
