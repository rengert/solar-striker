import { MAX_STAGE } from '../game-constants';
import { TranslationKey } from '../i18n/translations';

export type StorySpeaker = 'vega' | 'bolt' | 'nox' | 'herald';

export interface RadioLine {
  readonly speaker: StorySpeaker;
  readonly text: TranslationKey;
}

interface StoryChapter {
  readonly icon: string;
  /** Speakers of intro.1, intro.2, radio.1, radio.2 and outro, in that order. */
  readonly speakers: readonly [StorySpeaker, StorySpeaker, StorySpeaker, StorySpeaker, StorySpeaker];
}

// eslint-disable-next-line no-magic-numbers
export const SPEAKER_COLORS: Record<StorySpeaker, number> = { vega: 0x66ccff, bolt: 0xffcc55, nox: 0xff5566, herald: 0xccff33 };

/** One chapter per 10 stages, from Earth orbit out to the core of NOX and on to the heliopause. */
export const STORY_CHAPTERS: readonly StoryChapter[] = [
  { icon: '🌍', speakers: ['vega', 'vega', 'bolt', 'vega', 'nox'] },
  { icon: '🌙', speakers: ['vega', 'nox', 'bolt', 'vega', 'vega'] },
  { icon: '🔴', speakers: ['vega', 'nox', 'bolt', 'vega', 'vega'] },
  { icon: '☄️', speakers: ['vega', 'bolt', 'nox', 'vega', 'nox'] },
  { icon: '🟠', speakers: ['vega', 'bolt', 'vega', 'nox', 'vega'] },
  { icon: '🪐', speakers: ['vega', 'nox', 'bolt', 'vega', 'vega'] },
  { icon: '🧊', speakers: ['vega', 'nox', 'bolt', 'vega', 'nox'] },
  { icon: '🌀', speakers: ['vega', 'bolt', 'nox', 'vega', 'vega'] },
  { icon: '❄️', speakers: ['vega', 'nox', 'bolt', 'vega', 'vega'] },
  { icon: '👁️', speakers: ['nox', 'vega', 'nox', 'bolt', 'nox'] },
  { icon: '📡', speakers: ['vega', 'bolt', 'herald', 'vega', 'herald'] },
];

export const STAGES_PER_CHAPTER = MAX_STAGE / STORY_CHAPTERS.length;
/** From this chapter on NOX is gone and the Herald speaks in its place. */
const HERALD_CHAPTER = 11;

const BOSS_LINES: readonly RadioLine[] = [
  { speaker: 'vega', text: 'story.boss.1' },
  { speaker: 'bolt', text: 'story.boss.2' },
  { speaker: 'nox', text: 'story.boss.3' },
  { speaker: 'vega', text: 'story.boss.4' },
];

/** 1-based chapter of a stage. */
export function getChapter(stage: number): number {
  const clamped = Math.min(MAX_STAGE, Math.max(1, Math.floor(stage)));
  return Math.ceil(clamped / STAGES_PER_CHAPTER);
}

export function getChapterTitle(chapter: number): TranslationKey {
  return `story.chapter.${chapter}.title` as TranslationKey;
}

function getChapterLine(chapter: number, part: number, key: string): RadioLine {
  return {
    speaker: STORY_CHAPTERS[chapter - 1].speakers[part],
    text: `story.chapter.${chapter}.${key}` as TranslationKey,
  };
}

const ENDLESS_INTRO: readonly RadioLine[] = [
  { speaker: 'vega', text: 'story.endless.1' },
  { speaker: 'bolt', text: 'story.endless.2' },
];

/** Tips for new players, one per stage at the start of the campaign: controls, base, hangar, missions. */
const TUTORIAL_LINES: readonly RadioLine[] = [
  { speaker: 'vega', text: 'story.tutorial.1' },
  { speaker: 'vega', text: 'story.tutorial.2' },
  { speaker: 'bolt', text: 'story.tutorial.3' },
  { speaker: 'vega', text: 'story.tutorial.4' },
];

/**
 * Radio talk when a stage starts: the chapter intro on its first stage, one radio line otherwise.
 * With `tutorial`, the first stages add a tip for new players.
 */
export function getStageBriefing(stage: number, tutorial = false): RadioLine[] {
  const tip = tutorial ? TUTORIAL_LINES[Math.floor(stage) - 1] : undefined;
  if (!tip) {
    return getStoryBriefing(stage);
  }
  // the controls tip comes first, enemies are already on their way during the chapter intro
  return Math.floor(stage) === 1 ? [tip, ...getStoryBriefing(stage)] : [...getStoryBriefing(stage), tip];
}

function getStoryBriefing(stage: number): RadioLine[] {
  // endless mode runs past the story: one intro, then silence
  if (stage > MAX_STAGE) {
    return stage === MAX_STAGE + 1 ? [...ENDLESS_INTRO] : [];
  }
  const chapter = getChapter(stage);
  const position = (Math.floor(stage) - 1) % STAGES_PER_CHAPTER;
  if (position === 0) {
    return [getChapterLine(chapter, 0, 'intro.1'), getChapterLine(chapter, 1, 'intro.2')];
  }
  // stages alternate between the chapter's two radio lines
  // eslint-disable-next-line no-magic-numbers
  const radio = (position - 1) % 2;
  // eslint-disable-next-line no-magic-numbers
  return [getChapterLine(chapter, 2 + radio, `radio.${radio + 1}`)];
}

/** Radio talk after the boss of a stage: the chapter outro after its last boss, a short reaction otherwise. */
export function getBossDebriefing(stage: number): RadioLine[] {
  if (stage <= MAX_STAGE && Math.floor(stage) % STAGES_PER_CHAPTER === 0) {
    // eslint-disable-next-line no-magic-numbers
    return [getChapterLine(getChapter(stage), 4, 'outro')];
  }
  const line = BOSS_LINES[(Math.floor(stage) - 1) % BOSS_LINES.length];
  return [line.speaker === 'nox' && getChapter(stage) >= HERALD_CHAPTER ? { ...line, speaker: 'herald' } : line];
}
