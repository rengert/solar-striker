/* eslint-disable no-magic-numbers */
import { HighscoreEntry, calculateRunResult, isEndlessEntry } from './highscore.model';

function run(kills: number, date = '2026-10-31T12:00:00.000Z', level = 1): HighscoreEntry {
  return { id: `${kills}-${date}-${level}`, date, kills, level };
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

  it('ranks endless and campaign runs separately', () => {
    const endless = calculateRunResult([run(500, undefined, 150), run(80)], run(100, undefined, 120), now);

    expect(endless.rank).toBe(2);
    expect(endless.total).toBe(2);

    const campaign = calculateRunResult([run(500, undefined, 150), run(80)], run(100), now);

    expect(campaign.isRecord).toBeTrue();
    expect(campaign.total).toBe(2);
  });

  it('ranks weekly runs by level and only against the same week', () => {
    const createWeeklyRun = (kills: number, level: number, week: number): HighscoreEntry => ({ ...run(kills, undefined, level), mode: 'weekly', week });
    const result = calculateRunResult([createWeeklyRun(10, 12, 7), createWeeklyRun(90, 30, 6), run(500)], createWeeklyRun(5, 11, 7), now);

    expect(result.rank).toBe(2);
    expect(result.total).toBe(2);
    expect(result.previousBest).toBe(12);
  });

  it('ranks endless runs by level before kills', () => {
    const result = calculateRunResult([run(500, undefined, 120)], run(50, undefined, 140), now);

    expect(result.rank).toBe(1);
    expect(result.isRecord).toBeTrue();
    expect(result.previousBest).toBe(120);
    expect(result.killsToNextRank).toBeUndefined();
  });

  it('uses the stored mode over the level', () => {
    const longCampaign: HighscoreEntry = { ...run(10, undefined, 110), mode: 'campaign' };
    const shortEndless: HighscoreEntry = { ...run(10, undefined, 50), mode: 'endless' };

    expect(isEndlessEntry(longCampaign)).toBeFalse();
    expect(isEndlessEntry(shortEndless)).toBeTrue();
    expect(isEndlessEntry(run(10, undefined, 101))).toBeTrue();
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
