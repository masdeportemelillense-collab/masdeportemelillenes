import { createServerFn } from "@tanstack/react-start";
import type { TeamSquad } from "@/data/squads";

export const getTeamSquad = createServerFn({ method: "GET" })
  .inputValidator((d: { teamId: string }) => d)
  .handler(async ({ data }): Promise<TeamSquad | null> => {
    try {
      const { getLiveSquad } = await import("./squad.server");
      return (await getLiveSquad(data.teamId)) ?? null;
    } catch (err) {
      console.error("[squad] get", err);
      return null;
    }
  });
