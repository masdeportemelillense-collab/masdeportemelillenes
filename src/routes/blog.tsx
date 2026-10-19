import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listBlogPosts } from "@/lib/blog/actions";

export const Route = createFileRoute("/blog")({ component: BlogList });

function BlogList() {
  const q = useQuery({ queryKey: ["blog-posts"], queryFn: () => listBlogPosts() });
  const posts = q.data ?? [];
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Opinión</p>
        <h1 className="mt-2 font-display text-5xl leading-none">Blog Melillense</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">Rankings semanales, notas y análisis de los equipos de la ciudad.</p>
      </header>
      {q.isLoading ? <p className="text-sm text-muted">Cargando…</p> : null}
      {posts.length === 0 && !q.isLoading ? (
        <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted">Aún no hay entradas publicadas.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] transition-colors hover:bg-surface-2">
              <p className="text-[11px] uppercase tracking-wider text-muted">{new Date(p.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
              <h2 className="mt-2 font-display text-2xl leading-tight">{p.title}</h2>
              {p.excerpt ? <p className="mt-2 text-sm text-muted line-clamp-2">{p.excerpt}</p> : null}
              {p.content ? <p className="mt-2 text-sm text-fg/80 line-clamp-3 whitespace-pre-line">{p.content}</p> : null}
              {p.rankings && p.rankings.length > 0 ? <p className="mt-2 text-xs text-accent">{p.rankings.length} equipos en el ranking</p> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
