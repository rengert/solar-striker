/** Pilot ranks by kills over all runs, lowest first; every rank needs `kills` in total. */
export const PILOT_RANKS = [
  { id: 'cadet', kills: 0 },
  { id: 'ensign', kills: 100 },
  { id: 'lieutenant', kills: 300 },
  { id: 'firstLieutenant', kills: 750 },
  { id: 'captain', kills: 1500 },
  { id: 'major', kills: 3000 },
  { id: 'colonel', kills: 6000 },
  { id: 'commodore', kills: 12_000 },
  { id: 'admiral', kills: 25_000 },
  { id: 'fleetAdmiral', kills: 50_000 },
] as const;

export type PilotRankId = (typeof PILOT_RANKS)[number]['id'];

export interface PilotRank {
  id: PilotRankId;
  /** Kills still missing for the next rank, undefined at the top. */
  killsToNext?: number;
}

export function getPilotRank(totalKills: number): PilotRank {
  const index = PILOT_RANKS.findLastIndex((rank) => totalKills >= rank.kills);
  const next = PILOT_RANKS.at(index + 1);
  return { id: PILOT_RANKS[Math.max(0, index)].id, killsToNext: next ? next.kills - totalKills : undefined };
}
