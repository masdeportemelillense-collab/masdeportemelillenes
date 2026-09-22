import { getStore } from "https://esm.sh/@netlify/blobs@8.1.2";

const SECRET = "mdm-kv-melilla-2026";

export default async (request: Request) => {
  const url = new URL(request.url);
  if (url.searchParams.get("s") !== SECRET) {
    return new Response("forbidden", { status: 403 });
  }
  const key = url.searchParams.get("key") || "";
  if (!/^[a-z0-9._-]{1,80}$/i.test(key)) {
    return new Response("bad key", { status: 400 });
  }

  const store = getStore({ name: "mdm-persist", consistency: "strong" });

  if (request.method === "GET") {
    const value = await store.get(key);
    if (value == null) return new Response("", { status: 404 });
    return new Response(String(value), {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (request.method === "PUT") {
    const body = await request.text();
    await store.set(key, body);
    return new Response("ok");
  }

  return new Response("method", { status: 405 });
};

export const config = { path: "/__mdm-kv" };
