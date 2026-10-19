import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminDeleteBlogPost, adminListBlogPosts, adminSaveBlogPost } from "@/lib/blog/actions";
import type { BlogPost } from "@/lib/blog/types";

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
        <button type="button" className="h-9 rounded-md bg-accent px-3 text-sm text-bg" onClick={() => setEditing({ title: "", excerpt: "", content: "", published: true })}>Nueva entrada</button>
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
  const [published, setPublished] = useState(post.published !== false);
  const [msg, setMsg] = useState("");
  const save = useMutation({
    mutationFn: () => adminSaveBlogPost({ data: { id: post.id, title, excerpt, content, published } }),
    onSuccess: (res) => {
      if (res.ok) onSaved();
      else setMsg(res.error);
    },
  });
  return (
    <form className="space-y-3 rounded-xl bg-surface-2 p-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <label className="block text-xs uppercase tracking-wider text-muted">Título<input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface px-3 text-sm" required /></label>
      <label className="block text-xs uppercase tracking-wider text-muted">Extracto<input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1 h-10 w-full rounded-md bg-surface px-3 text-sm" /></label>
      <label className="block text-xs uppercase tracking-wider text-muted">Contenido<textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm" required /></label>
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
