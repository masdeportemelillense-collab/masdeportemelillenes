import { createServerFn } from "@tanstack/react-start";
import type { LiveSnapshot } from "@/lib/api/types";

export const getLiveSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveSnapshot> => {
    const { fetchLiveSnapshot } = await import("./thesportsdb.server");
    const snap = await fetchLiveSnapshot();
    try {
      const { listOverrides } = await import("@/lib/admin/store.server");
      return { ...snap, overrides: await listOverrides() };
    } catch {
      return snap;
    }
  },
);
