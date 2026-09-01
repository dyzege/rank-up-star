import { createServerFn } from "@tanstack/react-start";
import type { RankingEntry } from "./ranking.shared";

/** Publiczny ranking — dostępny bez logowania. */
export const getRanking = createServerFn({ method: "GET" }).handler(
  async (): Promise<RankingEntry[]> => {
    const { computeRanking } = await import("./ranking.server");
    return computeRanking();
  },
);
