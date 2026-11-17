/* eslint-disable no-magic-numbers */
import { claimLoginReward, LOGIN_REWARDS } from './login-reward.model';

describe('claimLoginReward', () => {
  it('starts a streak on the first visit', () => {
    expect(claimLoginReward(null, '2026-11-20')).toEqual({ state: { lastDay: '2026-11-20', streak: 1 }, day: 1, coins: LOGIN_REWARDS[0] });
  });

  it('pays nothing twice on the same day', () => {
    expect(claimLoginReward({ lastDay: '2026-11-20', streak: 3 }, '2026-11-20')).toBeNull();
  });

  it('continues on the next day, also across month ends', () => {
    expect(claimLoginReward({ lastDay: '2026-11-30', streak: 2 }, '2026-12-01')?.day).toBe(3);
  });

  it('restarts after a missed day', () => {
    expect(claimLoginReward({ lastDay: '2026-11-18', streak: 5 }, '2026-11-20')?.day).toBe(1);
  });

  it('starts the week again after day 7', () => {
    const reward = claimLoginReward({ lastDay: '2026-11-20', streak: 7 }, '2026-11-21');
    expect(reward?.state.streak).toBe(8);
    expect(reward?.day).toBe(1);
  });
});
