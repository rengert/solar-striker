/* eslint-disable no-magic-numbers */
import { getDifficultyLevel, getStageReward } from './game-constants';

describe('getDifficultyLevel', () => {
  it('should stay linear up to stage 20 and grow slower later on', () => {
    expect(getDifficultyLevel(1)).toBe(1);
    expect(getDifficultyLevel(20)).toBe(20);
    expect(getDifficultyLevel(100)).toBe(51);
    expect(getDifficultyLevel(1000)).toBe(150);
  });

  it('should never decrease from one stage to the next', () => {
    for (let stage = 1; stage < 1000; stage++) {
      expect(getDifficultyLevel(stage + 1)).toBeGreaterThanOrEqual(getDifficultyLevel(stage));
    }
  });
});

describe('getStageReward', () => {
  it('should pay the base reward in stage 1 and more later', () => {
    expect(getStageReward(10, 1)).toBe(10);
    expect(getStageReward(10, 100)).toBe(35);
  });

  it('should not grow past the last campaign stage', () => {
    expect(getStageReward(10, 1000)).toBe(getStageReward(10, 100));
  });
});
