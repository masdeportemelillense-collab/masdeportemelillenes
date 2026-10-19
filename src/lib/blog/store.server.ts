import { readDoc, updateDoc } from "@/lib/persist.server";
import type { BlogComment, BlogPost, RankingItem } from "./types";

const POSTS_KEY = "blog-posts";
const COMMENTS_KEY = "blog-comments";

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function listPosts(includeDrafts = false): Promise<BlogPost[]> {
  const all = await readDoc<BlogPost[]>(POSTS_KEY, []);
  return all
    .filter((p) => includeDrafts || p.published)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const all = await readDoc<BlogPost[]>(POSTS_KEY, []);
  return all.find((p) => p.slug === slug) ?? null;
}

export async function savePost(input: {
  id?: string;
  title: string;
  excerpt?: string;
  content: string;
  rankings?: RankingItem[];
  published?: boolean;
}): Promise<BlogPost> {
  const title = input.title.trim();
  if (title.length < 3) throw new Error("El título es demasiado corto");
  const now = Date.now();
  let saved: BlogPost | null = null;
  await updateDoc<BlogPost[]>(POSTS_KEY, [], (rows) => {
    const id = input.id || `${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = rows.find((p) => p.id === id);
    const slugBase = slugify(title) || id;
    let slug = existing?.slug || slugBase;
    if (!existing && rows.some((p) => p.slug === slug)) {
      slug = `${slugBase}-${id.slice(-4)}`;
    }
    const post: BlogPost = {
      id,
      slug,
      title,
      excerpt: (input.excerpt ?? "").trim().slice(0, 200),
      content: input.content.trim(),
      rankings: (input.rankings ?? []).filter((r) => r.teamName.trim().length > 0),
      published: input.published !== false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    saved = post;
    return [...rows.filter((p) => p.id !== id), post];
  });
  return saved!;
}

export async function deletePost(id: string): Promise<void> {
  await updateDoc<BlogPost[]>(POSTS_KEY, [], (rows) => rows.filter((p) => p.id !== id));
  await updateDoc<BlogComment[]>(COMMENTS_KEY, [], (rows) => rows.filter((c) => c.postId !== id));
}

export async function listComments(postId: string): Promise<BlogComment[]> {
  const all = await readDoc<BlogComment[]>(COMMENTS_KEY, []);
  return all.filter((c) => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt).slice(-100);
}

export async function addComment(postId: string, name: string, text: string): Promise<BlogComment> {
  const row: BlogComment = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    postId,
    name: name.trim().slice(0, 40),
    text: text.trim().slice(0, 500),
    createdAt: Date.now(),
  };
  await updateDoc<BlogComment[]>(COMMENTS_KEY, [], (rows) => {
    const next = [...rows, row];
    const mine = next.filter((c) => c.postId === postId);
    const others = next.filter((c) => c.postId !== postId);
    return [...others, ...mine.slice(-100)];
  });
  return row;
}
