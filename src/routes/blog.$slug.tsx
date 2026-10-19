import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addBlogComment, getBlogPost, listBlogComments } from "@/lib/blog/actions";
import { GRADE_COLOR, GRADE_LABEL } from "@/lib/blog/types";

export const Route = createFileRoute("/blog/$slug")({ component: BlogPostPage });

function BlogPostPage() {
  const { slug } = Route.useParams();
  const q = useQuery({ queryKey: ["blog-post", slug], queryFn: () => getBlogPost({ data: { slug } }) });
  if (q.isLoading) return <p className="text-sm text-muted">Cargando…</p>;
  if (!q.data) return <div className="space-y-2"><p className="text-sm text-muted">Entrada no encontrada.</p><p className="text-xs text-muted">Slug: {slug}</p></div>;
  const post = q.data;
  const rankings = Array.isArray(post.rankings) ? post.rankings : [];
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-wider text-muted">{new Date(post.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{post.title || "Sin título"}</h1>
        {post.excerpt ? <p className="mt-3 text-base text-muted">{post.excerpt}</p> : null}
      </header>

      <div className="rounded-xl bg-surface p-4 text-sm text-fg whitespace-pre-wrap">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted">Texto</p>
        {post.content && String(post.content).trim() ? String(post.content) : <span className="text-muted">(vacío)</span>}
      </div>

      <div className="rounded-xl bg-surface p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted">Ranking ({rankings.length})</p>
        {rankings.length === 0 ? <p className="text-sm text-muted">Sin equipos.</p> : rankings.map((r, i) => (
          <div key={i} className="mb-3 last:mb-0">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-medium ${GRADE_COLOR[r.grade] || ""}`}>{GRADE_LABEL[r.grade] || r.grade}</span>
              <span className="font-medium">{r.teamName || "—"}</span>
            </div>
            {r.note ? <p className="mt-1 text-sm text-fg">{r.note}</p> : <p className="text-xs text-muted">sin nota</p>}
          </div>
        ))}
      </div>

      <details className="text-xs text-muted">
        <summary>Datos crudos (debug)</summary>
        <pre className="mt-2 overflow-auto rounded bg-surface-2 p-2 text-[10px]">{JSON.stringify(post, null, 2)}</pre>
      </details>

      <Comments postId={post.id} />
    </article>
  );
}

function Comments({ postId }: { postId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["blog-comments", postId], queryFn: () => listBlogComments({ data: { postId } }) });
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const add = useMutation({
    mutationFn: () => addBlogComment({ data: { postId, name, text } }),
    onSuccess: (res) => {
      if (res.ok) { setText(""); setMsg("Comentario publicado"); void qc.invalidateQueries({ queryKey: ["blog-comments", postId] }); }
      else setMsg(res.error);
    },
  });
  const comments = q.data ?? [];
  return (
    <section className="border-t border-border pt-6">
      <h2 className="font-display text-2xl">Comentarios ({comments.length})</h2>
      <form className="mt-4 space-y-2" onSubmit={(e) => { e.preventDefault(); setMsg(""); add.mutate(); }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="h-10 w-full rounded-md bg-surface px-3 text-sm" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Comentario…" rows={3} className="w-full rounded-md bg-surface px-3 py-2 text-sm" />
        <button type="submit" disabled={add.isPending} className="h-10 rounded-md bg-accent px-4 text-sm text-bg">Comentar</button>
        {msg ? <p className="text-xs text-muted">{msg}</p> : null}
      </form>
      <ul className="mt-6 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="rounded-xl bg-surface p-3">
            <p className="text-sm font-medium">{c.name}</p>
            <p className="mt-1 text-sm">{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
