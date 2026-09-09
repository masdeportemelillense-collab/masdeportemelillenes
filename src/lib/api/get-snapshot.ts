import { createServerFn } from "@tanstack/react-start";
import type { LiveSnapshot } from "@/lib/api/types";

export const getLiveSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveSnapshot> => {
    const { fetchLiveSnapshot } = await import("./thesportsdb.server");
    return fetchLiveSnapshot();
  },
);
