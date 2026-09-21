/**
 * Durable JSON documents for admin overrides and the porra.
 *
 * Priority:
 *  1. Neon / Postgres when DATABASE_URL is set (`app_kv` table)
 *  2. Netlify Blobs on Netlify (survives deploys and cold starts)
 *  3. /tmp + memory (local preview)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

type Driver = {
  name: "blobs" | "sql" | "file";
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
};

const g = globalThis as typeof globalThis & {
  __mdmPersistDriver?: Promise<Driver>;
  __mdmPersistMem?: Map<string, string>;
  __mdmPersistLocks?: Map<string, Promise<unknown>>;
};

function mem(): Map<string, string> {
  if (!g.__mdmPersistMem) g.__mdmPersistMem = new Map();
  return g.__mdmPersistMem;
}

function filePath(key: string): string {
  return `/tmp/mdm-kv-${key.replace(/[^a-z0-9._-]+/gi, "_")}.json`;
}

function fileDriver(): Driver {
  return {
    name: "file",
    async get(key) {
      const hit = mem().get(key);
      if (hit != null) return hit;
      try {
        const raw = await readFile(filePath(key), "utf8");
        mem().set(key, raw);
        return raw;
      } catch {
        return null;
      }
    },
    async set(key, value) {
      mem().set(key, value);
      try {
        const path = filePath(key);
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, value);
      } catch {
        /* ephemeral FS */
      }
    },
  };
}

type BlobsCtx = {
  token: string;
  siteID?: string;
  apiURL?: string;
  edgeURL?: string;
  uncachedEdgeURL?: string;
  url?: string;
};

function decodeBlobsContext(): BlobsCtx | null {
  const raw = process.env.NETLIFY_BLOBS_CONTEXT;
  if (raw) {
    try {
      const parsed = JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")) as BlobsCtx;
      if (parsed?.token) return parsed;
    } catch {
      /* ignore */
    }
  }
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.BLOBS_TOKEN;
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  if (token && siteID) return { token, siteID, apiURL: "https://api.netlify.com" };
  return null;
}

function blobObjectUrl(ctx: BlobsCtx, key: string): string {
  const siteID = ctx.siteID || process.env.NETLIFY_SITE_ID || process.env.SITE_ID || "";
  const store = `site:mdm-persist`;
  const path = `/${siteID}/${store}/${key}`;
  const edge = ctx.uncachedEdgeURL || ctx.edgeURL || ctx.url;
  if (edge && !edge.includes("api.netlify.com")) {
    return new URL(path, edge).toString();
  }
  return new URL(`/api/v1/blobs${path}`, ctx.apiURL || "https://api.netlify.com").toString();
}

async function blobsDriver(): Promise<Driver | null> {
  try {
    const mod = await import("@netlify/blobs").catch(() => null);
    if (mod?.getStore) {
      const store = mod.getStore({ name: "mdm-persist", consistency: "strong" });
      return {
        name: "blobs",
        async get(key) {
          const value = await store.get(key, { type: "text" });
          return value == null ? null : String(value);
        },
        async set(key, value) {
          await store.set(key, value);
        },
      };
    }
  } catch {
    /* package missing or env not wired */
  }

  const ctx = decodeBlobsContext();
  if (!ctx) return null;
  return {
    name: "blobs",
    async get(key) {
      const res = await fetch(blobObjectUrl(ctx, key), {
        headers: { authorization: `Bearer ${ctx.token}` },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`blobs get ${res.status}`);
      return await res.text();
    },
    async set(key, value) {
      const res = await fetch(blobObjectUrl(ctx, key), {
        method: "PUT",
        headers: {
          authorization: `Bearer ${ctx.token}`,
          "content-type": "text/plain; charset=utf-8",
        },
        body: value,
      });
      if (!res.ok) throw new Error(`blobs set ${res.status}`);
    },
  };
}

async function sqlDriver(): Promise<Driver | null> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query(
      `create table if not exists app_kv (
        key text primary key,
        value text not null,
        updated_at timestamptz not null default now()
      )`,
    );
    return {
      name: "sql",
      async get(key) {
        const rows = await sql.query<{ value: string }>(
          "select value from app_kv where key = $1",
          [key],
        );
        return rows[0]?.value ?? null;
      },
      async set(key, value) {
        await sql.query(
          `insert into app_kv (key, value, updated_at)
           values ($1, $2, now())
           on conflict (key) do update set value = excluded.value, updated_at = now()`,
          [key, value],
        );
      },
    };
  } catch (err) {
    console.error("[persist] sql driver failed, falling back", err);
    return null;
  }
}

async function resolveDriver(): Promise<Driver> {
  if (!g.__mdmPersistDriver) {
    g.__mdmPersistDriver = (async () => {
      const sql = await sqlDriver();
      if (sql) return sql;
      const blobs = await blobsDriver();
      if (blobs) return blobs;
      return fileDriver();
    })().catch((err) => {
      g.__mdmPersistDriver = undefined;
      throw err;
    });
  }
  return g.__mdmPersistDriver;
}

export async function persistBackend(): Promise<Driver["name"]> {
  return (await resolveDriver()).name;
}

export async function readDoc<T>(key: string, fallback: T): Promise<T> {
  const driver = await resolveDriver();
  try {
    const raw = await driver.get(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeDoc<T>(key: string, value: T): Promise<void> {
  const driver = await resolveDriver();
  await driver.set(key, JSON.stringify(value));
}

/** Serialize read-modify-write per key inside one isolate. */
export async function updateDoc<T>(
  key: string,
  fallback: T,
  mutator: (current: T) => T | Promise<T>,
): Promise<T> {
  if (!g.__mdmPersistLocks) g.__mdmPersistLocks = new Map();
  const locks = g.__mdmPersistLocks;
  const prev = locks.get(key) ?? Promise.resolve();
  let release: () => void = () => undefined;
  const hold = new Promise<void>((resolve) => {
    release = resolve;
  });
  locks.set(
    key,
    prev.then(() => hold),
  );
  await prev.catch(() => undefined);
  try {
    const current = await readDoc(key, fallback);
    const next = await mutator(current);
    await writeDoc(key, next);
    return next;
  } finally {
    release();
  }
}
