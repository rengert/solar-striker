export interface HighscoreEntry {
  id: string;
  date: string;
  kills: number;
  level: number;
  // missing on runs saved before combo/coins were tracked
  combo?: number;
  coins?: number;
}

export interface RunResult {
  entry: HighscoreEntry;
  rank: number;
  total: number;
  isRecord: boolean;
  isDailyBest: boolean;
  previousBest: number;
  // kills needed to overtake the next better run, undefined when already first
  killsToNextRank?: number;
}

export function compareEntries(a: HighscoreEntry, b: HighscoreEntry): number {
  return b.kills - a.kills || b.level - a.level || b.date.localeCompare(a.date);
}

export function isSameDay(isoDate: string, now: Date): boolean {
  return new Date(isoDate).toDateString() === now.toDateString();
}

/** Ranks a finished run against the previously stored runs (which must not contain it yet). */
export function calculateRunResult(history: HighscoreEntry[], entry: HighscoreEntry, now = new Date()): RunResult {
  const better = history.filter((other) => other.kills > entry.kills);
  const previousBest = Math.max(0, ...history.map((other) => other.kills));
  const todayBest = Math.max(0, ...history.filter((other) => isSameDay(other.date, now)).map((other) => other.kills));
  const nextTarget = better.length ? Math.min(...better.map((other) => other.kills)) : undefined;

  return {
    entry,
    rank: better.length + 1,
    total: history.length + 1,
    isRecord: entry.kills > previousBest,
    isDailyBest: entry.kills > todayBest,
    previousBest,
    killsToNextRank: nextTarget === undefined ? undefined : nextTarget - entry.kills + 1,
  };
}
