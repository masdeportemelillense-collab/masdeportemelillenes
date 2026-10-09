import { createServerFn } from "@tanstack/react-start";
import type { Group9Round } from "./group9.server";

export const getGroup9 = createServerFn({ method: "GET" }).handler(async (): Promise<Group9Round | null> => {
  try {
    const { fetchGroup9 } = await import("./group9.server");
    return await fetchGroup9();
  } catch (err) {
    console.error("[group9]", err);
    return null;
  }
});
