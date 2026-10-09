import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addMatchComment, listMatchComments } from "@/lib/comments/actions";

export function MatchComments({ matchId }: { matchId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["comments", matchId], queryFn: () => listMatchComments({ data: { matchId } }) });
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: () => addMatchComment({ data: { matchId, name, text } }),
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setText("");
      setError("");
      void qc.invalidateQueries({ queryKey: ["comments", matchId] });
    },
  });
  const rows = q.data ?? [];
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-3xl leading-none">Comentarios</h2>
      <p className="mt-1 text-xs text-muted">Solo hace falta un nombre. No hay registro.</p>
      <ul className="mt-3 space-y-2">
        {rows.length === 0 ? <li className="text-sm text-muted">Todavía no hay comentarios.</li> : null}
        {rows.map((c) => (
          <li key={c.id} className="rounded-xl bg-surface-2 px-3 py-2">
            <p className="text-xs font-medium text-accent">{c.name}</p>
            <p className="mt-1 text-sm">{c.text}</p>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          save.mutate();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" maxLength={24} className="h-10 rounded-md bg-surface-2 px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un comentario" maxLength={280} rows={3} className="rounded-md bg-surface-2 px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
        {error ? <p className="text-sm text-loss">{error}</p> : null}
        <button type="submit" disabled={save.isPending} className="h-10 rounded-md bg-accent text-sm font-medium text-bg disabled:opacity-60">
          {save.isPending ? "Enviando…" : "Publicar comentario"}
        </button>
      </form>
    </section>
  );
}
