/**
 * Shared JSON store for porra + admin overrides.
 * Production: Netlify Edge Function /__mdm-kv (Netlify Blobs).
 */

type DriverName = "blobs" | "file";

const SECRET = "mdm-kv-melilla-2026";
const ORIGIN = "https://masdeportemelillene.netlify.app";

const g = globalThis as typeof globalThis & {
  __mdmPersistMem?: Map<string, string>;
  __mdmPersistLocks?: Map<string, Promise<unknown>>;
};

function mem(): Map<string, string> {
  if (!g.__mdmPersistMem) g.__mdmPersistMem = new Map();
  return g.__mdmPersistMem;
}

function kvUrl(key: string): string {
  return `${ORIGIN}/__mdm-kv?key=${encodeURIComponent(key)}&s=${SECRET}`;
}

async function kvGet(key: string): Promise<string | null> {
  const res = await fetch(kvUrl(key), { method: "GET", cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`No se pudo leer (${res.status})`);
  const text = await res.text();
  return text || null;
}

async function kvSet(key: string, value: string): Promise<void> {
  const res = await fetch(kvUrl(key), {
    method: "PUT",
    cache: "no-store",
    headers: { "content-type": "text/plain; charset=utf-8" },
    body: value,
  });
  if (!res.ok) throw new Error(`No se pudo guardar (${res.status})`);
}

export async function persistBackend(): Promise<DriverName> {
  return "blobs";
}

export async function readDoc<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await kvGet(key);
    if (!raw) {
      const cached = mem().get(key);
      if (cached) return JSON.parse(cached) as T;
      return fallback;
    }
    mem().set(key, raw);
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("[persist] read", key, err);
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
  await kvSet(key, raw);
  if (key === "porra") {
    try {
      await kvSet("porra-backup", raw);
    } catch (err) {
      console.error("[persist] backup", err);
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
