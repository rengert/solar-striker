/* eslint-disable no-magic-numbers */
import { getDayIndex } from './daily-challenge.model';
import { getWeekIndex, getWeeklyChallenge } from './weekly-challenge.model';

describe('weekly challenge', () => {
  it('starts a new week on Monday', () => {
    const sunday = getWeekIndex(getDayIndex('2026-11-08'));

    expect(getWeekIndex(getDayIndex('2026-11-02'))).toBe(sunday);
    expect(getWeekIndex(getDayIndex('2026-11-09'))).toBe(sunday + 1);
  });

  it('changes rule and start stage every week', () => {
    const first = getWeeklyChallenge(100);
    const next = getWeeklyChallenge(101);

    expect(next.rule).not.toBe(first.rule);
    expect(next.stage).not.toBe(first.stage);
    expect(first.ruleKey).toBe(`weekly.rule.${first.rule}`);
  });
});
