// campaign length when runs were saved without a mode; must stay 100 even if the campaign grows
const LEGACY_CAMPAIGN_STAGES = 100;

export type GameMode = 'campaign' | 'endless' | 'weekly';
const MODE_ORDER: Record<GameMode, number> = { campaign: 0, endless: 1, weekly: 2 };

export interface HighscoreEntry {
  id: string;
  date: string;
  kills: number;
  level: number;
  // missing on runs saved before combo/coins were tracked
  combo?: number;
  coins?: number;
  // missing on runs saved before the endless tab existed
  mode?: GameMode;
  // week of a weekly challenge run, see getWeekIndex
  week?: number;
}

export interface RunResult {
  entry: HighscoreEntry;
  rank: number;
  total: number;
  isRecord: boolean;
  isDailyBest: boolean;
  // kills of the best earlier run, its level for endless and weekly runs
  previousBest: number;
  // kills needed to overtake the next better run, undefined when already first
  killsToNextRank?: number;
}

/** Campaign runs rank by kills, endless and weekly runs by how far they got; modes sort campaign, endless, weekly. */
function compareScore(a: HighscoreEntry, b: HighscoreEntry): number {
  const mode = getEntryMode(a);
  return MODE_ORDER[mode] - MODE_ORDER[getEntryMode(b)]
    || (mode === 'campaign' ? b.kills - a.kills || b.level - a.level : b.level - a.level || b.kills - a.kills);
}

export function compareEntries(a: HighscoreEntry, b: HighscoreEntry): number {
  return compareScore(a, b) || b.date.localeCompare(a.date);
}

export function getEntryMode(entry: HighscoreEntry): GameMode {
  // old runs have no mode, but endless always started after stage 100 back then
  return entry.mode ?? (entry.level > LEGACY_CAMPAIGN_STAGES ? 'endless' : 'campaign');
}

export function isEndlessEntry(entry: HighscoreEntry): boolean {
  return getEntryMode(entry) === 'endless';
}

export function isSameDay(isoDate: string, now: Date): boolean {
  return new Date(isoDate).toDateString() === now.toDateString();
}

/** Ranks a finished run against the stored runs of the same mode and week (which must not contain it yet). */
export function calculateRunResult(allRuns: HighscoreEntry[], entry: HighscoreEntry, now = new Date()): RunResult {
  const mode = getEntryMode(entry);
  // endless and weekly rank by level, so kills say nothing about the next place there
  const byLevel = mode !== 'campaign';
  const history = allRuns.filter((other) => getEntryMode(other) === mode && other.week === entry.week);
  const better = history.filter((other) => compareScore(other, entry) < 0);
  const isAheadOfAll = (runs: HighscoreEntry[]): boolean => entry.kills > 0 && runs.every((other) => compareScore(entry, other) < 0);
  const best = [...history].sort(compareScore).at(0);
  const nextTarget = !byLevel && better.length ? Math.min(...better.map((other) => other.kills)) : undefined;

  return {
    entry,
    rank: better.length + 1,
    total: history.length + 1,
    isRecord: isAheadOfAll(history),
    isDailyBest: isAheadOfAll(history.filter((other) => isSameDay(other.date, now))),
    previousBest: (byLevel ? best?.level : best?.kills) ?? 0,
    killsToNextRank: nextTarget === undefined ? undefined : nextTarget - entry.kills + 1,
  };
}
