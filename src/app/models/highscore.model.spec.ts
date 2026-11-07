/* eslint-disable no-magic-numbers */
import { HighscoreEntry, calculateRunResult } from './highscore.model';

function run(kills: number, date = '2026-10-31T12:00:00.000Z'): HighscoreEntry {
  return { id: `${kills}-${date}`, date, kills, level: 1 };
}

describe('calculateRunResult', () => {
  const now = new Date('2026-10-31T18:00:00.000Z');

  it('treats the very first run as record', () => {
    const result = calculateRunResult([], run(5), now);

    expect(result.rank).toBe(1);
    expect(result.total).toBe(1);
    expect(result.isRecord).toBeTrue();
    expect(result.killsToNextRank).toBeUndefined();
  });

  it('computes rank and kills needed for the next place', () => {
    const result = calculateRunResult([run(50), run(30), run(10)], run(20), now);

    expect(result.rank).toBe(3);
    expect(result.total).toBe(4);
    expect(result.isRecord).toBeFalse();
    expect(result.previousBest).toBe(50);
    expect(result.killsToNextRank).toBe(11);
  });

  it('detects a daily best that is not an all-time record', () => {
    const result = calculateRunResult([run(100, '2026-10-01T12:00:00.000Z'), run(10)], run(20), now);

    expect(result.isRecord).toBeFalse();
    expect(result.isDailyBest).toBeTrue();
  });

  it('does not count a tie as a new record', () => {
    expect(calculateRunResult([run(20)], run(20), now).isRecord).toBeFalse();
  });

  it('does not count a zero-kill first run as record', () => {
    expect(calculateRunResult([], run(0), now).isRecord).toBeFalse();
  });
});
