export type AchievementId =
  | 'first_kill'
  | 'sharp_shooter'
  | 'veteran'
  | 'combo_rookie'
  | 'combo_master'
  | 'level_10'
  | 'level_20'
  | 'boss_hunter'
  | 'nuke_deployed'
  | 'rich_pilot';

export interface AchievementDefinition {
  id: AchievementId;
  icon: string;
  reward: number;
  threshold: number;
  /** true = counts total across all games; false = checked within one game session */
  cumulative: boolean;
}

export interface AchievementState {
  id: AchievementId;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

const FIRST_KILL_THRESHOLD = 1;
const SHARP_SHOOTER_THRESHOLD = 100;
const VETERAN_THRESHOLD = 500;
const COMBO_ROOKIE_THRESHOLD = 3;
const COMBO_MASTER_THRESHOLD = 5;
const LEVEL_10_THRESHOLD = 10;
const LEVEL_20_THRESHOLD = 20;
const BOSS_HUNTER_THRESHOLD = 1;
const NUKE_THRESHOLD = 1;
const RICH_PILOT_THRESHOLD = 50;

const REWARD_XS = 5;
const REWARD_S = 10;
const REWARD_M = 15;
const REWARD_L = 20;
const REWARD_XL = 25;
const REWARD_XXL = 30;

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first_kill', icon: '🎯', threshold: FIRST_KILL_THRESHOLD, reward: REWARD_XS, cumulative: true },
  { id: 'sharp_shooter', icon: '⚡', threshold: SHARP_SHOOTER_THRESHOLD, reward: REWARD_M, cumulative: true },
  { id: 'veteran', icon: '⭐', threshold: VETERAN_THRESHOLD, reward: REWARD_XXL, cumulative: true },
  { id: 'combo_rookie', icon: '🔥', threshold: COMBO_ROOKIE_THRESHOLD, reward: REWARD_XS, cumulative: false },
  { id: 'combo_master', icon: '💫', threshold: COMBO_MASTER_THRESHOLD, reward: REWARD_L, cumulative: false },
  { id: 'level_10', icon: '🚀', threshold: LEVEL_10_THRESHOLD, reward: REWARD_S, cumulative: false },
  { id: 'level_20', icon: '🏆', threshold: LEVEL_20_THRESHOLD, reward: REWARD_XL, cumulative: false },
  { id: 'boss_hunter', icon: '👾', threshold: BOSS_HUNTER_THRESHOLD, reward: REWARD_S, cumulative: false },
  { id: 'nuke_deployed', icon: '☢', threshold: NUKE_THRESHOLD, reward: REWARD_XS, cumulative: false },
  { id: 'rich_pilot', icon: '💰', threshold: RICH_PILOT_THRESHOLD, reward: REWARD_M, cumulative: false },
];
