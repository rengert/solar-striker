export type DailyChallengeType = 'kills' | 'combo' | 'level' | 'coins' | 'boss';

export interface DailyChallengeDefinition {
  id: string;
  type: DailyChallengeType;
  threshold: number;
  reward: number;
  icon: string;
}

export interface DailyChallengeState {
  date: string; // 'YYYY-MM-DD'
  progress: Record<string, number>;
  completed: Record<string, boolean>;
}

const REWARD_S = 6;
const REWARD_M = 10;
const REWARD_L = 15;
const REWARD_XL = 20;
const REWARD_XXL = 25;
const REWARD_XXXL = 30;

export const DAILY_CHALLENGE_POOL: DailyChallengeDefinition[] = [
  { id: 'dc_kills_20', type: 'kills', threshold: 20, reward: REWARD_S, icon: '🎯' },
  { id: 'dc_combo_3', type: 'combo', threshold: 3, reward: REWARD_S, icon: '🔥' },
  { id: 'dc_boss_1', type: 'boss', threshold: 1, reward: REWARD_S, icon: '👾' },
  { id: 'dc_kills_50', type: 'kills', threshold: 50, reward: REWARD_L, icon: '🎯' },
  { id: 'dc_combo_4', type: 'combo', threshold: 4, reward: REWARD_M, icon: '🔥' },
  { id: 'dc_level_10', type: 'level', threshold: 10, reward: REWARD_L, icon: '🚀' },
  { id: 'dc_kills_100', type: 'kills', threshold: 100, reward: REWARD_XXL, icon: '🎯' },
  { id: 'dc_combo_5', type: 'combo', threshold: 5, reward: REWARD_L, icon: '💫' },
  { id: 'dc_level_15', type: 'level', threshold: 15, reward: REWARD_XL, icon: '🚀' },
  { id: 'dc_coins_30', type: 'coins', threshold: 30, reward: REWARD_M, icon: '💰' },
  { id: 'dc_coins_60', type: 'coins', threshold: 60, reward: REWARD_XL, icon: '💰' },
  { id: 'dc_level_20', type: 'level', threshold: 20, reward: REWARD_XXXL, icon: '🏆' },
];

const CHALLENGES_PER_DAY = 3;
// eslint-disable-next-line no-magic-numbers
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ISO_DATE_LENGTH = 10;

export function getDailyChallenges(dayIndex: number): DailyChallengeDefinition[] {
  const size = DAILY_CHALLENGE_POOL.length;
  const result: DailyChallengeDefinition[] = [];
  for (let i = 0; i < CHALLENGES_PER_DAY; i++) {
    result.push(DAILY_CHALLENGE_POOL[(dayIndex + i) % size]);
  }
  return result;
}

export function getTodayDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, ISO_DATE_LENGTH);
}

export function getDayIndex(dateKey?: string): number {
  const key = dateKey ?? getTodayDateKey();
  return Math.floor(new Date(key).getTime() / DAY_IN_MS);
}
