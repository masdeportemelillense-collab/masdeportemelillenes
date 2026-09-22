/**
 * Durable JSON documents for admin overrides and the porra.
 *
 * Priority:
 *  1. Neon / Postgres when DATABASE_URL or Netlify Database is available
 *  2. Netlify Blobs (survives deploys and cold starts)
 *  3. /tmp + memory (last resort — one isolate only)
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

async function netlifySqlUrl(): Promise<string | undefined> {
  const direct = process.env.DATABASE_URL?.trim();
  if (direct) return direct;
  try {
    const mod = (await import("@netlify/database").catch(() => null)) as
      | { getConnectionString?: () => string | Promise<string> }
      | null;
    const url = await mod?.getConnectionString?.();
    return url?.trim() || undefined;
  } catch {
    return undefined;
  }
}

async function sqlDriver(): Promise<Driver | null> {
  const url = await netlifySqlUrl();
  if (!url) return null;
  try {
    const { getSql } = await import("@/lib/db");
    // getSql() only uses DATABASE_URL; if only Netlify Database is present,
    // talk to pg directly with that connection string.
    if (process.env.DATABASE_URL?.trim()) {
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
          const rows = await sql.query<{ value: string }>("select value from app_kv where key = $1", [key]);
          return rows[0]?.value ?? null;
        },
        async set(key, value) {
          await sql.query(
            `insert into app_kv (key, value, updated_at) values ($1, $2, now())
             on conflict (key) do update set value = excluded.value, updated_at = now()`,
            [key, value],
          );
        },
      };
    }

    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    await pool.query(
      `create table if not exists app_kv (
        key text primary key,
        value text not null,
        updated_at timestamptz not null default now()
      )`,
    );
    return {
      name: "sql",
      async get(key) {
        const res = await pool.query("select value from app_kv where key = $1", [key]);
        return (res.rows[0]?.value as string | undefined) ?? null;
      },
      async set(key, value) {
        await pool.query(
          `insert into app_kv (key, value, updated_at) values ($1, $2, now())
           on conflict (key) do update set value = excluded.value, updated_at = now()`,
          [key, value],
        );
      },
    };
  } catch (err) {
    console.error("[persist] sql driver failed", err);
    return null;
  }
}

async function officialBlobsDriver(): Promise<Driver | null> {
  try {
    const mod = (await import("@netlify/blobs").catch(() => null)) as
      | {
          getStore?: (opts: { name: string; consistency?: string }) => {
            get: (key: string, opts?: { type: string }) => Promise<string | null>;
            set: (key: string, value: string) => Promise<void>;
          };
        }
      | null;
    if (!mod?.getStore) return null;
    const store = mod.getStore({ name: "mdm-persist", consistency: "strong" });
    // Probe: a missing key must resolve, not throw.
    await store.get("__probe__", { type: "text" });
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
  } catch (err) {
    console.error("[persist] netlify blobs package unavailable", err);
    return null;
  }
}

async function resolveDriver(): Promise<Driver> {
  if (!g.__mdmPersistDriver) {
    g.__mdmPersistDriver = (async () => {
      const sql = await sqlDriver();
      if (sql) return sql;
      const blobs = await officialBlobsDriver();
      if (blobs) return blobs;
      console.warn("[persist] using ephemeral file store — edits will not survive another function instance");
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
  const cached = mem().get(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      /* fall through */
    }
  }
  const driver = await resolveDriver();
  try {
    const raw = await driver.get(key);
    if (!raw) return fallback;
    mem().set(key, raw);
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("[persist] read failed", key, err);
    return fallback;
  }
}

export async function writeDoc<T>(key: string, value: T): Promise<void> {
  const raw = JSON.stringify(value);
  mem().set(key, raw);
  const driver = await resolveDriver();
  await driver.set(key, raw);
  // Mirror to /tmp so the same isolate can recover if the remote read is slow.
  if (driver.name !== "file") {
    try {
      await fileDriver().set(key, raw);
    } catch {
      /* ignore */
    }
  }
}

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
