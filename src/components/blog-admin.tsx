import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminDeleteBlogPost, adminListBlogPosts, adminSaveBlogPost } from "@/lib/blog/actions";
import type { BlogPost, Grade, RankingItem } from "@/lib/blog/types";
import { GRADE_COLOR, GRADE_LABEL } from "@/lib/blog/types";
import { teams } from "@/data/teams";

export function BlogAdmin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-blog"], queryFn: () => adminListBlogPosts() });
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const refresh = () => void qc.invalidateQueries({ queryKey: ["admin-blog"] });
  const posts = q.data?.ok ? q.data.posts : [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Entradas del blog</h2>
        <button type="button" className="h-9 rounded-md bg-accent px-3 text-sm text-bg" onClick={() => setEditing({ title: "", excerpt: "", content: "", rankings: [], published: true })}>Nueva entrada</button>
      </div>
      {editing ? <Editor post={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} /> : null}
      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl bg-surface p-3">
            <div>
              <p className="font-medium">{p.title} {!p.published ? <span className="text-xs text-muted">(borrador)</span> : null}</p>
              <p className="text-xs text-muted">{new Date(p.createdAt).toLocaleDateString("es-ES")} · /blog/{p.slug}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="h-8 rounded-md bg-surface-2 px-2 text-xs" onClick={() => setEditing(p)}>Editar</button>
              <DeleteButton id={p.id} onDone={refresh} />
            </div>
          </div>
        ))}
        {posts.length === 0 ? <p className="text-sm text-muted">No hay entradas.</p> : null}
      </div>
    </div>
  );
}

function Editor({ post, onClose, onSaved }: { post: Partial<BlogPost>; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(post.title ?? "");
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [content, setContent] = useState(post.content ?? "");
  const [rankings, setRankings] = useState<RankingItem[]>(post.rankings ?? []);
  const [published, setPublished] = useState(post.published !== false);
  const [msg, setMsg] = useState("");
  const save = useMutation({
    mutationFn: () => adminSaveBlogPost({ data: { id: post.id, title, excerpt, content, rankings, published } }),
    onSuccess: (res) => {
      if (res.ok) onSaved();
      else setMsg(res.error);
    },
  });
  function addRanking() {
    setRankings((prev) => [...prev, { teamName: "", grade: "aprobado", note: "" }]);
  }
  function updateRanking(i: number, patch: Partial<RankingItem>) {
    setRankings((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function removeRanking(i: number) {
    setRankings((prev) => prev.filter((_, idx) => idx !== i));
  }
  return (
    <form className="space-y-3 rounded-xl bg-surface-2 p-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <label className="block text-xs uppercase tracking-wider text-muted">Título<input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface px-3 text-sm" required /></label>
      <label className="block text-xs uppercase tracking-wider text-muted">Extracto<input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface px-3 text-sm" /></label>
      <label className="block text-xs uppercase tracking-wider text-muted">Texto libre<textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm" placeholder="Introducción o comentarios generales de la semana…" /></label>

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Ranking de equipos</p>
          <button type="button" className="h-8 rounded-md bg-surface px-3 text-xs" onClick={addRanking}>+ Añadir equipo</button>
        </div>
        <div className="mt-2 space-y-2">
          {rankings.map((r, i) => (
            <div key={i} className="grid gap-2 rounded-lg bg-surface p-2 sm:grid-cols-12">
              <select
                value={r.teamId ?? ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const team = teams.find((t) => t.id === id);
                  updateRanking(i, { teamId: id || undefined, teamName: team?.name ?? r.teamName });
                }}
                className="h-9 rounded-md bg-surface-2 px-2 text-sm sm:col-span-4"
              >
                <option value="">Seleccionar equipo…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.sport})</option>
                ))}
              </select>
              <input
                value={r.teamName}
                onChange={(e) => updateRanking(i, { teamName: e.target.value })}
                placeholder="Nombre (si no está en la lista)"
                className="h-9 rounded-md bg-surface-2 px-2 text-sm sm:col-span-3"
              />
              <select
                value={r.grade}
                onChange={(e) => updateRanking(i, { grade: e.target.value as Grade })}
                className={`h-9 rounded-md px-2 text-sm sm:col-span-2 ${GRADE_COLOR[r.grade]}`}
              >
                <option value="sobresaliente">Sobresaliente</option>
                <option value="aprobado">Aprobado</option>
                <option value="suspendido">Suspendido</option>
              </select>
              <input
                value={r.note}
                onChange={(e) => updateRanking(i, { note: e.target.value })}
                placeholder="Nota corta"
                className="h-9 rounded-md bg-surface-2 px-2 text-sm sm:col-span-2"
              />
              <button type="button" className="h-9 rounded-md bg-surface-2 text-xs text-muted sm:col-span-1" onClick={() => removeRanking(i)}>Quitar</button>
            </div>
          ))}
          {rankings.length === 0 ? <p className="text-xs text-muted">Añade equipos y asigna nota (verde / amarillo / rojo).</p> : null}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Publicada</label>
      <div className="flex gap-2">
        <button type="submit" disabled={save.isPending} className="h-9 rounded-md bg-accent px-3 text-sm text-bg">{save.isPending ? "Guardando…" : "Guardar"}</button>
        <button type="button" className="h-9 rounded-md bg-surface px-3 text-sm" onClick={onClose}>Cancelar</button>
        {msg ? <span className="text-xs text-muted">{msg}</span> : null}
      </div>
    </form>
  );
}

function DeleteButton({ id, onDone }: { id: string; onDone: () => void }) {
  const del = useMutation({
    mutationFn: () => adminDeleteBlogPost({ data: { id } }),
    onSuccess: () => onDone(),
  });
  return <button type="button" className="h-8 rounded-md bg-surface-2 px-2 text-xs text-muted" onClick={() => { if (confirm("¿Borrar entrada?")) del.mutate(); }}>Borrar</button>;
}
