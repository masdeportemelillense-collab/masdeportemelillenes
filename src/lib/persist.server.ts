/**
 * Durable JSON documents for admin overrides and the porra.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

type Driver = {
  name: "blobs" | "sql" | "file";
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
};

const KV_SECRET = "mdm-kv-melilla-2026";

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

function siteOrigin(): string | null {
  const candidates = [
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.DEPLOY_URL,
    process.env.SITE_URL,
    "https://masdeportemelillene.netlify.app",
  ];
  for (const raw of candidates) {
    const value = raw?.trim();
    if (value && /^https?:\/\//.test(value)) return value.replace(/\/$/, "");
  }
  return null;
}

async function edgeKvDriver(): Promise<Driver | null> {
  const origin = siteOrigin();
  if (!origin || !origin.includes("netlify.app")) return null;
  const endpoint = (key: string) => `${origin}/__mdm-kv?key=${encodeURIComponent(key)}&s=${KV_SECRET}`;
  try {
    const probe = await fetch(endpoint("__probe__"), { method: "GET" });
    if (probe.status === 403 || probe.status === 404 || probe.status === 200) {
      /* endpoint exists */
    } else if (probe.status >= 500) {
      return null;
    }
  } catch {
    return null;
  }
  return {
    name: "blobs",
    async get(key) {
      const res = await fetch(endpoint(key), { method: "GET" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`kv get ${res.status}`);
      return await res.text();
    },
    async set(key, value) {
      const res = await fetch(endpoint(key), { method: "PUT", body: value });
      if (!res.ok) throw new Error(`kv set ${res.status}`);
    },
  };
}

async function dynImport(mod: string): Promise<any | null> {
  try {
    return await (Function("m", "return import(m)") as (m: string) => Promise<any>)(mod);
  } catch {
    return null;
  }
}

async function officialBlobsDriver(): Promise<Driver | null> {
  const mod = await dynImport("@netlify/blobs");
  if (!mod?.getStore) return null;
  try {
    const store = mod.getStore({ name: "mdm-persist", consistency: "strong" });
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
  } catch {
    return null;
  }
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
  } catch {
    return null;
  }
}

async function resolveDriver(): Promise<Driver> {
  if (!g.__mdmPersistDriver) {
    g.__mdmPersistDriver = (async () => {
      const sql = await sqlDriver();
      if (sql) return sql;
      const edge = await edgeKvDriver();
      if (edge) return edge;
      const blobs = await officialBlobsDriver();
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
    if (!raw) {
      const cached = mem().get(key);
      if (cached) return JSON.parse(cached) as T;
      return fallback;
    }
    mem().set(key, raw);
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("[persist] read failed", key, err);
    const cached = mem().get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        /* ignore */
      }
    }
    return fallback;
  }
}

export async function writeDoc<T>(key: string, value: T): Promise<void> {
  const raw = JSON.stringify(value);
  mem().set(key, raw);
  const driver = await resolveDriver();
  if (driver.name === "file" && process.env.NETLIFY) {
    throw new Error("El almacén permanente no está listo en este deploy.");
  }
  await driver.set(key, raw);
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
  locks.set(key, prev.then(() => hold));
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
