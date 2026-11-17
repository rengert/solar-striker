import { getDayIndex } from './daily-challenge.model';

/** Coins for day 1 to 7 of a login streak; after day 7 the week starts again. */
// eslint-disable-next-line no-magic-numbers
export const LOGIN_REWARDS = [5, 10, 15, 20, 25, 30, 60] as const;

export interface LoginStreakState {
  /** Date key (YYYY-MM-DD) of the last claimed day. */
  lastDay: string;
  /** Consecutive days claimed so far, 1 on the first day. */
  streak: number;
}

export interface LoginReward {
  state: LoginStreakState;
  /** Day of the 7-day week, 1-7. */
  day: number;
  coins: number;
}

/** The reward for opening the game on `today`, or null if today was already claimed. A missed day restarts the streak. */
export function claimLoginReward(previous: LoginStreakState | null, today: string): LoginReward | null {
  if (previous?.lastDay === today) {
    return null;
  }
  const continues = previous !== null && getDayIndex(today) - getDayIndex(previous.lastDay) === 1;
  const streak = continues ? previous.streak + 1 : 1;
  const day = ((streak - 1) % LOGIN_REWARDS.length) + 1;
  return { state: { lastDay: today, streak }, day, coins: LOGIN_REWARDS[day - 1] };
}
