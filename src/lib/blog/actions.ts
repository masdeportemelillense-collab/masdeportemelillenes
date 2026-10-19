import { createServerFn } from "@tanstack/react-start";
import type { BlogComment, BlogPost, RankingItem } from "./types";

export const listBlogPosts = createServerFn({ method: "GET" }).handler(async (): Promise<BlogPost[]> => {
  const { listPosts } = await import("./store.server");
  return listPosts(false);
});

export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<BlogPost | null> => {
    const { getPost } = await import("./store.server");
    return getPost(data.slug);
  });

export const listBlogComments = createServerFn({ method: "GET" })
  .inputValidator((d: { postId: string }) => d)
  .handler(async ({ data }): Promise<BlogComment[]> => {
    const { listComments } = await import("./store.server");
    return listComments(data.postId);
  });

export const addBlogComment = createServerFn({ method: "POST" })
  .inputValidator((d: { postId: string; name: string; text: string }) => d)
  .handler(async ({ data }) => {
    const name = String(data.name ?? "").trim();
    const text = String(data.text ?? "").trim();
    if (name.length < 2) return { ok: false as const, error: "Pon un nombre de al menos 2 letras." };
    if (text.length < 2) return { ok: false as const, error: "Escribe un comentario." };
    const { addComment } = await import("./store.server");
    const comment = await addComment(data.postId, name, text);
    return { ok: true as const, comment };
  });

export const adminListBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/admin/session.server");
  if (!(await requireAdmin())) return { ok: false as const, posts: [] as BlogPost[] };
  const { listPosts } = await import("./store.server");
  return { ok: true as const, posts: await listPosts(true) };
});

export const adminSaveBlogPost = createServerFn({ method: "POST" })
  .inputValidator((d: { id?: string; title: string; excerpt?: string; content: string; rankings?: RankingItem[]; published?: boolean }) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin/session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    try {
      const { savePost } = await import("./store.server");
      const post = await savePost(data);
      return { ok: true as const, post };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Error al guardar" };
    }
  });

export const adminDeleteBlogPost = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin/session.server");
    if (!(await requireAdmin())) return { ok: false as const, error: "Sesión caducada." };
    const { deletePost } = await import("./store.server");
    await deletePost(data.id);
    return { ok: true as const };
  });
