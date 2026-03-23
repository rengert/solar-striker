import { getDailySurpriseIcon } from './navigation-popup';

// eslint-disable-next-line no-magic-numbers
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THIRD_DAY_MULTIPLIER = 2;
const FOURTH_DAY_MULTIPLIER = 3;

describe('getDailySurpriseIcon', () => {
  it('should return a stable icon for the same day', () => {
    const date = new Date('2026-03-23T00:00:00.000Z');

    const first = getDailySurpriseIcon(date);
    const second = getDailySurpriseIcon(date);

    expect(first).toBe(second);
  });

  it('should rotate icons across consecutive days', () => {
    const baseDate = new Date(0);
    const nextDay = new Date(ONE_DAY_MS);
    const thirdDay = new Date(ONE_DAY_MS * THIRD_DAY_MULTIPLIER);
    const fourthDay = new Date(ONE_DAY_MS * FOURTH_DAY_MULTIPLIER);

    const icon1 = getDailySurpriseIcon(baseDate);
    const icon2 = getDailySurpriseIcon(nextDay);
    const icon3 = getDailySurpriseIcon(thirdDay);
    const icon4 = getDailySurpriseIcon(fourthDay);

    expect(icon1).not.toBe(icon2);
    expect(icon2).not.toBe(icon3);
    expect(icon4).toBe(icon1);
  });
});
