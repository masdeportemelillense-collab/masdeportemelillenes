import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listBlogPosts } from "@/lib/blog/actions";
import { GRADE_COLOR, GRADE_LABEL } from "@/lib/blog/types";

export const Route = createFileRoute("/blog")({ component: BlogList });

function BlogList() {
  const q = useQuery({ queryKey: ["blog-posts"], queryFn: () => listBlogPosts() });
  const posts = q.data ?? [];
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Opinión</p>
        <h1 className="mt-2 font-display text-5xl leading-none">Blog Melillense</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">Rankings semanales, notas y análisis de los equipos de la ciudad. Pincha en una entrada para leerla completa.</p>
      </header>
      {q.isLoading ? <p className="text-sm text-muted">Cargando…</p> : null}
      {posts.length === 0 && !q.isLoading ? (
        <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted">Aún no hay entradas publicadas.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function BlogCard({ post }: { post: any }) {
  const [open, setOpen] = useState(false);
  const rankings = Array.isArray(post.rankings) ? post.rankings : [];
  return (
    <article className="rounded-2xl bg-surface shadow-[var(--shadow-border)]">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 p-5 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted">{new Date(post.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
          <h2 className="mt-1 font-display text-2xl leading-tight">{post.title}</h2>
          {!open && post.excerpt ? <p className="mt-1 text-sm text-muted line-clamp-2">{post.excerpt}</p> : null}
          {!open && rankings.length > 0 ? <p className="mt-1 text-xs text-accent">{rankings.length} equipos en el ranking</p> : null}
        </div>
        <span className="mt-1 shrink-0 text-sm text-muted">{open ? "Cerrar" : "Leer"}</span>
      </button>

      {open ? (
        <div className="border-t border-border px-5 pb-5 pt-4">
          {post.content && String(post.content).trim() ? (
            <div className="mb-4 text-sm leading-relaxed text-fg whitespace-pre-wrap">{post.content}</div>
          ) : null}

          {rankings.length > 0 ? (
            <div>
              <h3 className="mb-2 font-display text-xl">Ranking de la semana</h3>
              <div className="space-y-2">
                {rankings.map((r: any, i: number) => (
                  <div key={i} className="rounded-xl bg-surface-2 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-semibold ${GRADE_COLOR[r.grade] || ""}`}>
                        {GRADE_LABEL[r.grade] || r.grade}
                      </span>
                      <span className="font-medium">{r.teamName || "Equipo"}</span>
                    </div>
                    {r.note && String(r.note).trim() ? <p className="mt-1 text-sm text-fg/90">{r.note}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!post.content?.trim() && rankings.length === 0 ? (
            <p className="text-sm text-muted">Esta entrada no tiene texto ni ranking.</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
