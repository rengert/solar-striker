/* eslint-disable no-magic-numbers */
import { TranslationKey } from '../i18n/translations';

export type SeasonEventId = 'newyear' | 'christmas' | 'chinese-newyear' | 'valentine' | 'easter' | 'halloween';

/** How the background ambience moves: falling (snow, petals), rising (embers) or bursting (fireworks). */
export type SeasonAmbience = 'fall' | 'rise' | 'burst';

export interface SeasonEvent {
  readonly id: SeasonEventId;
  readonly name: TranslationKey;
  /** Emojis drawn on top of normal enemies, one picked per enemy. */
  readonly enemyIcons: readonly string[];
  /** Full-screen color wash over the background. */
  readonly backgroundTint: number;
  readonly backgroundAlpha: number;
  readonly ambience: SeasonAmbience;
  /** Colors for ambience particles and explosion sparks. */
  readonly colors: readonly number[];
  /** Day of the event's anchor date for the given year, as local Date. undefined if unknown. */
  readonly anchor: (year: number) => Date | undefined;
  /** Active window in days around the anchor, inclusive. */
  readonly from: number;
  readonly to: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Easter Sunday (Gregorian), anonymous Gregorian algorithm. */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

let chineseFormat: Intl.DateTimeFormat | null | undefined;

/**
 * First day of the Chinese lunar year, via the browser's Chinese calendar. undefined if the browser lacks it.
 * shortcut: ICU can be a day off when the new moon is near midnight (2027), harmless for a multi-day event window.
 */
export function getChineseNewYear(year: number): Date | undefined {
  if (chineseFormat === undefined) {
    try {
      chineseFormat = new Intl.DateTimeFormat('en-u-ca-chinese', { month: 'numeric', day: 'numeric' });
      chineseFormat = chineseFormat.resolvedOptions().calendar === 'chinese' ? chineseFormat : null;
    } catch {
      chineseFormat = null;
    }
  }
  if (!chineseFormat) {
    return undefined;
  }
  // always falls between Jan 21 and Feb 20
  for (let day = 21; day <= 51; day++) {
    const date = new Date(year, 0, day);
    const parts = chineseFormat.formatToParts(date);
    if (parts.find((part) => part.type === 'month')?.value === '1'
      && parts.find((part) => part.type === 'day')?.value === '1') {
      return date;
    }
  }
  return undefined;
}

/** Ordered by priority: the first match wins when windows overlap. */
export const SEASON_EVENTS: readonly SeasonEvent[] = [
  {
    id: 'newyear', name: 'event.newyear', enemyIcons: ['🎆', '🍾', '🥳'],
    backgroundTint: 0x0a1040, backgroundAlpha: 0.25, ambience: 'burst',
    colors: [0xff4455, 0x44ddff, 0xffdd44, 0x66ff66, 0xff66ff],
    anchor: (year) => new Date(year, 11, 31), from: -4, to: 2,
  },
  {
    id: 'christmas', name: 'event.christmas', enemyIcons: ['🎁', '⛄', '🎄'],
    backgroundTint: 0x103060, backgroundAlpha: 0.2, ambience: 'fall',
    colors: [0xffffff, 0xddeeff, 0xff4444, 0x44dd66],
    anchor: (year) => new Date(year, 11, 24), from: -23, to: 2,
  },
  {
    id: 'chinese-newyear', name: 'event.chinese-newyear', enemyIcons: ['🏮', '🧧', '🐉'],
    backgroundTint: 0x500808, backgroundAlpha: 0.25, ambience: 'burst',
    colors: [0xff3333, 0xffcc33, 0xffaa22],
    anchor: getChineseNewYear, from: -3, to: 7,
  },
  {
    id: 'valentine', name: 'event.valentine', enemyIcons: ['💖', '💘', '🌹'],
    backgroundTint: 0x501030, backgroundAlpha: 0.2, ambience: 'fall',
    colors: [0xff5599, 0xff88cc, 0xff3366],
    anchor: (year) => new Date(year, 1, 14), from: -3, to: 0,
  },
  {
    id: 'easter', name: 'event.easter', enemyIcons: ['🥚', '🐰', '🐣'],
    backgroundTint: 0x205020, backgroundAlpha: 0.18, ambience: 'fall',
    colors: [0xffaacc, 0xaaddff, 0xffff99, 0xbbffaa, 0xddbbff],
    anchor: getEasterSunday, from: -7, to: 1,
  },
  {
    id: 'halloween', name: 'event.halloween', enemyIcons: ['🎃', '👻', '🦇'],
    backgroundTint: 0x2a0840, backgroundAlpha: 0.3, ambience: 'rise',
    colors: [0xff8800, 0x99ff33, 0xaa44ff],
    anchor: (year) => new Date(year, 9, 31), from: -7, to: 2,
  },
];

function toDayNumber(date: Date): number {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

/**
 * The event active on the given day. `override` (the `?event=` URL parameter) forces an event by id
 * for testing, `none` disables events.
 */
export function getActiveSeasonEvent(now: Date, override?: string | null): SeasonEvent | undefined {
  if (override) {
    return SEASON_EVENTS.find((event) => event.id === override);
  }
  const today = toDayNumber(now);
  const year = now.getFullYear();
  return SEASON_EVENTS.find((event) => [year - 1, year, year + 1].some((y) => {
    const anchor = event.anchor(y);
    if (!anchor) {
      return false;
    }
    const offset = today - toDayNumber(anchor);
    return offset >= event.from && offset <= event.to;
  }));
}

/** Evaluated once at startup; an event that starts mid-session shows after the next reload. */
export const CURRENT_SEASON_EVENT = getActiveSeasonEvent(
  new Date(),
  typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('event'),
);
