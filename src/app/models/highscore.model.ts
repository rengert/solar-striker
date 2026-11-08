// campaign length when runs were saved without a mode; must stay 100 even if the campaign grows
const LEGACY_CAMPAIGN_STAGES = 100;

export interface HighscoreEntry {
  id: string;
  date: string;
  kills: number;
  level: number;
  // missing on runs saved before combo/coins were tracked
  combo?: number;
  coins?: number;
  // missing on runs saved before the endless tab existed
  mode?: 'campaign' | 'endless';
}

export interface RunResult {
  entry: HighscoreEntry;
  rank: number;
  total: number;
  isRecord: boolean;
  isDailyBest: boolean;
  // kills of the best earlier run, its level for endless runs
  previousBest: number;
  // kills needed to overtake the next better run, undefined when already first
  killsToNextRank?: number;
}

/** Campaign runs rank by kills, endless runs by how far they got; campaign runs sort before endless ones. */
function compareScore(a: HighscoreEntry, b: HighscoreEntry): number {
  const endless = isEndlessEntry(a);
  return Number(endless) - Number(isEndlessEntry(b))
    || (endless ? b.level - a.level || b.kills - a.kills : b.kills - a.kills || b.level - a.level);
}

export function compareEntries(a: HighscoreEntry, b: HighscoreEntry): number {
  return compareScore(a, b) || b.date.localeCompare(a.date);
}

export function isEndlessEntry(entry: HighscoreEntry): boolean {
  // old runs have no mode, but endless always started after stage 100 back then
  return entry.mode ? entry.mode === 'endless' : entry.level > LEGACY_CAMPAIGN_STAGES;
}

export function isSameDay(isoDate: string, now: Date): boolean {
  return new Date(isoDate).toDateString() === now.toDateString();
}

/** Ranks a finished run against the previously stored runs of the same mode (which must not contain it yet). */
export function calculateRunResult(allRuns: HighscoreEntry[], entry: HighscoreEntry, now = new Date()): RunResult {
  const endless = isEndlessEntry(entry);
  const history = allRuns.filter((other) => isEndlessEntry(other) === endless);
  const better = history.filter((other) => compareScore(other, entry) < 0);
  const isAheadOfAll = (runs: HighscoreEntry[]): boolean => entry.kills > 0 && runs.every((other) => compareScore(entry, other) < 0);
  const best = [...history].sort(compareScore).at(0);
  // endless ranks by level, so kills say nothing about the next place there
  const nextTarget = !endless && better.length ? Math.min(...better.map((other) => other.kills)) : undefined;

  return {
    entry,
    rank: better.length + 1,
    total: history.length + 1,
    isRecord: isAheadOfAll(history),
    isDailyBest: isAheadOfAll(history.filter((other) => isSameDay(other.date, now))),
    previousBest: (endless ? best?.level : best?.kills) ?? 0,
    killsToNextRank: nextTarget === undefined ? undefined : nextTarget - entry.kills + 1,
  };
}
