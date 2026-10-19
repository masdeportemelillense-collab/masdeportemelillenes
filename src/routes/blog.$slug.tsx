import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addBlogComment, getBlogPost, listBlogComments } from "@/lib/blog/actions";

export const Route = createFileRoute("/blog/$slug")({ component: BlogPostPage });

function BlogPostPage() {
  const { slug } = Route.useParams();
  const q = useQuery({ queryKey: ["blog-post", slug], queryFn: () => getBlogPost({ data: { slug } }) });
  if (q.isLoading) return <p className="text-sm text-muted">Cargando…</p>;
  if (!q.data) throw notFound();
  const post = q.data;
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-wider text-muted">{new Date(post.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{post.title}</h1>
        {post.excerpt ? <p className="mt-3 text-base text-muted">{post.excerpt}</p> : null}
      </header>
      <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-fg">{post.content}</div>
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
      if (res.ok) {
        setText("");
        setMsg("Comentario publicado");
        void qc.invalidateQueries({ queryKey: ["blog-comments", postId] });
      } else {
        setMsg(res.error);
      }
    },
  });
  const comments = q.data ?? [];
  return (
    <section className="border-t border-border pt-6">
      <h2 className="font-display text-2xl">Comentarios ({comments.length})</h2>
      <p className="mt-1 text-xs text-muted">Cualquiera puede comentar. Solo nombre y texto, sin registro.</p>
      <form className="mt-4 space-y-2" onSubmit={(e) => { e.preventDefault(); setMsg(""); add.mutate(); }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="h-10 w-full rounded-md bg-surface px-3 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un comentario…" rows={3} className="w-full rounded-md bg-surface px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-accent/60" />
        <button type="submit" disabled={add.isPending} className="h-10 rounded-md bg-accent px-4 text-sm font-medium text-bg disabled:opacity-60">{add.isPending ? "Enviando…" : "Comentar"}</button>
        {msg ? <p className="text-xs text-muted">{msg}</p> : null}
      </form>
      <ul className="mt-6 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="rounded-xl bg-surface p-3">
            <p className="text-sm font-medium">{c.name} <span className="text-xs font-normal text-muted">· {new Date(c.createdAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></p>
            <p className="mt-1 text-sm text-fg/90">{c.text}</p>
          </li>
        ))}
        {comments.length === 0 ? <p className="text-sm text-muted">Sé el primero en comentar.</p> : null}
      </ul>
    </section>
  );
}
