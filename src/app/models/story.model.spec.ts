import { MAX_STAGE } from '../game-constants';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import { getBossDebriefing, getChapter, getChapterTitle, getStageBriefing, STORY_CHAPTERS } from './story.model';

const LAST_STAGE_OF_FIRST_CHAPTER = 10;
const FIRST_STAGE_OF_SECOND_CHAPTER = 11;
const SECOND_STAGE = 2;
const THIRD_STAGE = 3;

describe('story', () => {
  it('should split the stages into chapters of equal length', () => {
    expect(getChapter(1)).toBe(1);
    expect(getChapter(LAST_STAGE_OF_FIRST_CHAPTER)).toBe(1);
    expect(getChapter(FIRST_STAGE_OF_SECOND_CHAPTER)).toBe(SECOND_STAGE);
    expect(getChapter(MAX_STAGE)).toBe(STORY_CHAPTERS.length);
  });

  it('should play the chapter intro on its first stage and one radio line on the others', () => {
    expect(getStageBriefing(FIRST_STAGE_OF_SECOND_CHAPTER).map(({ text }) => text)).toEqual([
      'story.chapter.2.intro.1',
      'story.chapter.2.intro.2',
    ]);
    expect(getStageBriefing(SECOND_STAGE).map(({ text }) => text)).toEqual(['story.chapter.1.radio.1']);
    expect(getStageBriefing(THIRD_STAGE).map(({ text }) => text)).toEqual(['story.chapter.1.radio.2']);
  });

  it('should close a chapter with its outro after the last boss', () => {
    expect(getBossDebriefing(LAST_STAGE_OF_FIRST_CHAPTER).map(({ text }) => text)).toEqual(['story.chapter.1.outro']);
    expect(getBossDebriefing(1)[0].text).toMatch(/^story\.boss\./);
  });

  it('should only play the endless intro on the first stage after the campaign', () => {
    expect(getStageBriefing(MAX_STAGE + 1).map(({ text }) => text)).toEqual(['story.endless.1', 'story.endless.2']);
    expect(getStageBriefing(MAX_STAGE + SECOND_STAGE)).toEqual([]);
    expect(getBossDebriefing(MAX_STAGE + LAST_STAGE_OF_FIRST_CHAPTER)[0].text).toMatch(/^story\.boss\./);
  });

  SUPPORTED_LANGUAGES.forEach((language) => {
    it(`should have every radio line and chapter title in ${language}`, () => {
      const keys = Array.from({ length: MAX_STAGE }, (_, index) => index + 1).flatMap((stage) => [
        getChapterTitle(getChapter(stage)),
        ...[...getStageBriefing(stage), ...getBossDebriefing(stage)].map(({ text }) => text),
      ]);
      expect(keys.filter((key) => !(key in TRANSLATIONS[language]))).toEqual([]);
    });
  });
});
