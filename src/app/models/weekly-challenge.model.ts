import { TranslationKey } from '../i18n/translations';
import { getDayIndex } from './daily-challenge.model';

export type WeeklyRule = 'noPowerUps' | 'swarm' | 'fragileBase';

export interface WeeklyChallenge {
  /** Weeks since the epoch, counted from Monday; runs are ranked within one week. */
  week: number;
  rule: WeeklyRule;
  icon: string;
  stage: number;
  ruleKey: TranslationKey;
}

const RULES: { rule: WeeklyRule; icon: string }[] = [
  { rule: 'noPowerUps', icon: '🔫' },
  { rule: 'swarm', icon: '🐝' },
  { rule: 'fragileBase', icon: '💔' },
];
// 4 start stages against 3 rules: the same combination only comes back after 12 weeks
// eslint-disable-next-line no-magic-numbers
const START_STAGES = [5, 10, 15, 20];
const DAYS_PER_WEEK = 7;
// day 0 (1970-01-01) was a Thursday, shifting by 3 days makes weeks start on Monday
const MONDAY_OFFSET = 3;

/** Enemies spawn this many times as often under the swarm rule. */
export const SWARM_SPAWN_FACTOR = 2;
/** Home base energy under the fragile base rule. */
export const FRAGILE_BASE_ENERGY = 3;

export function getWeekIndex(dayIndex = getDayIndex()): number {
  return Math.floor((dayIndex + MONDAY_OFFSET) / DAYS_PER_WEEK);
}

export function getWeeklyChallenge(week = getWeekIndex()): WeeklyChallenge {
  const { rule, icon } = RULES[week % RULES.length];
  return { week, rule, icon, stage: START_STAGES[week % START_STAGES.length], ruleKey: `weekly.rule.${rule}` };
}
