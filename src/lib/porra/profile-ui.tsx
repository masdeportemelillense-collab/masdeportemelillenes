import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { porraReadNotices, porraRecover, porraSetTicket } from "./actions";
import type { PorraNotice, PorraPublicState } from "./types";
import { cn } from "@/lib/utils";

export function NoticeBoard({
  notices,
  onSaved,
}: {
  notices: PorraNotice[];
  onSaved: (state: PorraPublicState) => void;
}) {
  const unread = notices.filter((n) => !n.read);
  const mark = useMutation({
    mutationFn: () => porraReadNotices(),
    onSuccess: (res) => {
      if (res.ok) onSaved(res.state);
    },
  });
  if (!notices.length) return null;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-3xl leading-none">Avisos del ticket</h2>
        {unread.length ? (
          <button type="button" onClick={() => mark.mutate()} className="text-xs uppercase tracking-wider text-accent hover:underline">
            Marcar leídos
          </button>
        ) : null}
      </div>
      <ul className="mt-3 space-y-2">
        {notices.slice(0, 8).map((n) => (
          <li key={n.id} className={cn("rounded-xl bg-surface-2 px-3 py-2", !n.read && "ring-1 ring-accent/40")}>
            <p className="text-xs uppercase tracking-wider text-muted">{n.title}</p>
            <p className="mt-1 whitespace-pre-line text-sm">{n.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RecoverForm({ onDone }: { onDone: (state: PorraPublicState) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const act = useMutation({
    mutationFn: () => porraRecover({ data: { name, email, password } }),
    onSuccess: (res) => {
      if (res.ok) onDone(res.state);
      else setError(res.error);
    },
  });
  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        act.mutate();
      }}
    >
      <label className="block text-xs uppercase tracking-wider text-muted">
        Alias
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
      </label>
      <label className="block text-xs uppercase tracking-wider text-muted">
        Email del perfil
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
      </label>
      <label className="block text-xs uppercase tracking-wider text-muted sm:col-span-2">
        Nueva contraseña
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 h-11 w-full rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
      </label>
      {error ? <p className="text-sm text-loss sm:col-span-2">{error}</p> : null}
      <button type="submit" disabled={act.isPending} className="h-11 rounded-md bg-accent text-sm font-medium text-bg disabled:opacity-60 sm:col-span-2">
        {act.isPending ? "Comprobando…" : "Cambiar contraseña y entrar"}
      </button>
    </form>
  );
}

export function TicketSwitch({
  slateId,
  enabled,
  onSaved,
}: {
  slateId: string;
  enabled: boolean;
  onSaved: (state: PorraPublicState) => void;
}) {
  const act = useMutation({
    mutationFn: (next: boolean) => porraSetTicket({ data: { slateId, enabled: next } }),
    onSuccess: (res) => {
      if (res.ok) onSaved(res.state);
    },
  });
  return (
    <label className="mt-3 flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-3 text-sm">
      <input type="checkbox" checked={enabled} disabled={act.isPending} onChange={(e) => act.mutate(e.target.checked)} className="mt-0.5" />
      <span>
        <span className="font-medium">Ticket de avisos</span>
        <span className="block text-xs text-muted">Si lo marcas, te avisamos en esta página cada vez que se cierre un partido de esta jornada y cómo vas en la porra.</span>
      </span>
    </label>
  );
}
