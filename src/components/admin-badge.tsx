import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminSession } from "@/lib/admin/actions";
import { adminSetBadge } from "@/lib/badges/actions";
import type { ResolvedMatch } from "@/lib/types";

export function AdminBadgeEditor({ match }: { match: ResolvedMatch }) {
  const session = useQuery({ queryKey: ["admin-session"], queryFn: () => adminSession(), staleTime: 30_000 });
  if (!session.data?.ok) return null;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-3xl leading-none">Escudos · administración</h2>
      <p className="mt-1 text-xs text-muted">Solo lo ves tú. Pega la URL del escudo. Vale para el equipo melillense y para el rival, y se aplica en todos sus partidos.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <BadgeField teamId={match.homeId} name={match.homeName} current={match.homeBadge} />
        <BadgeField teamId={match.awayId} name={match.awayName} current={match.awayBadge} />
      </div>
    </section>
  );
}

function BadgeField({ teamId, name, current }: { teamId?: string; name: string; current?: string }) {
  const qc = useQueryClient();
  const [url, setUrl] = useState(current ?? "");
  const [msg, setMsg] = useState("");
  const save = useMutation({
    mutationFn: () => adminSetBadge({ data: { teamId, name, badgeUrl: url } }),
    onSuccess: (res) => {
      setMsg(res.ok ? "Escudo guardado." : res.error);
      if (res.ok) void qc.invalidateQueries({ queryKey: ["live-snapshot"] });
    },
  });
  return (
    <form
      className="rounded-xl bg-surface-2 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg("");
        save.mutate();
      }}
    >
      <p className="text-sm font-medium">{name}</p>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/escudo.png" className="mt-2 h-10 w-full rounded-md bg-surface px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
      <button type="submit" disabled={save.isPending} className="mt-2 h-9 rounded-md bg-accent px-3 text-xs font-medium text-bg disabled:opacity-60">
        {save.isPending ? "Guardando…" : "Guardar escudo"}
      </button>
      {msg ? <p className="mt-1 text-xs text-muted">{msg}</p> : null}
    </form>
  );
}
