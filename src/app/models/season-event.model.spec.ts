/* eslint-disable no-magic-numbers */
import { getActiveSeasonEvent, getChineseNewYear, getEasterSunday } from './season-event.model';

describe('season events', () => {
  it('calculates Easter Sunday', () => {
    expect(getEasterSunday(2025).toDateString()).toBe(new Date(2025, 3, 20).toDateString());
    expect(getEasterSunday(2026).toDateString()).toBe(new Date(2026, 3, 5).toDateString());
    expect(getEasterSunday(2027).toDateString()).toBe(new Date(2027, 2, 28).toDateString());
  });

  it('calculates Chinese New Year', () => {
    expect(getChineseNewYear(2025)?.toDateString()).toBe(new Date(2025, 0, 29).toDateString());
    expect(getChineseNewYear(2026)?.toDateString()).toBe(new Date(2026, 1, 17).toDateString());
    expect(getChineseNewYear(2028)?.toDateString()).toBe(new Date(2028, 0, 26).toDateString());
  });

  it('picks the event for the date', () => {
    const at = (year: number, month: number, day: number): string | undefined =>
      getActiveSeasonEvent(new Date(year, month - 1, day))?.id;
    expect(at(2026, 10, 31)).toBe('halloween');
    expect(at(2026, 10, 23)).toBeUndefined();
    expect(at(2026, 12, 10)).toBe('christmas');
    expect(at(2026, 12, 29)).toBe('newyear');
    expect(at(2027, 1, 2)).toBe('newyear');
    expect(at(2027, 1, 3)).toBeUndefined();
    expect(at(2026, 2, 20)).toBe('chinese-newyear');
    expect(at(2026, 2, 13)).toBe('valentine');
    expect(at(2026, 4, 6)).toBe('easter');
    expect(at(2026, 7, 1)).toBeUndefined();
  });

  it('can be forced or disabled for testing', () => {
    expect(getActiveSeasonEvent(new Date(2026, 6, 1), 'easter')?.id).toBe('easter');
    expect(getActiveSeasonEvent(new Date(2026, 9, 31), 'none')).toBeUndefined();
  });
});
