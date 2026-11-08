/* eslint-disable no-magic-numbers */
import { getDifficultyLevel, getStageReward } from './game-constants';

describe('getDifficultyLevel', () => {
  it('should start at the stage and grow slower later on', () => {
    expect(getDifficultyLevel(1)).toBe(1);
    expect(getDifficultyLevel(2)).toBe(2);
    expect(getDifficultyLevel(100)).toBe(37);
    expect(getDifficultyLevel(1000)).toBe(133);
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
    expect(getStageReward(10, 100)).toBe(46);
  });
});
