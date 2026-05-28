import { Text } from 'pixi.js';
import { THE_MIDDLE } from '../game-constants';
import { DailyChallengeEntry } from '../services/daily-challenge.service';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 340;
const CHALLENGE_START_Y = -60;
const CHALLENGE_ROW_SPACING = 42;
const CHALLENGE_TITLE_X = -80;
const CHALLENGE_STATUS_X = 95;
const CHALLENGE_TITLE_SIZE = 11;
const CHALLENGE_STATUS_SIZE = 9;
const STATUS_LINE_OFFSET = 18;
const BACK_BUTTON_INDEX = 4;

interface ChallengeRowContext {
  entry: DailyChallengeEntry;
  translation: TranslationService;
  rowY: number;
}

export class DailyChallengesPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('daily.title'), POPUP_HEIGHT);

    const entries = gameService.dailyChallengeService.getToday();

    for (let i = 0; i < entries.length; i++) {
      const rowY = CHALLENGE_START_Y + i * CHALLENGE_ROW_SPACING;
      this.addChallengeRow({ entry: entries[i], translation, rowY });
    }

    this.addButton(
      translation.getTranslation('common.back'),
      () => gameService.openNavigation(this),
      BACK_BUTTON_INDEX,
    );
  }

  private addChallengeRow({ entry, translation, rowY }: ChallengeRowContext): void {
    const { def, progress, completed } = entry;
    const descKey = `daily.${def.id}.description` as Parameters<typeof translation.getTranslation>[0];
    const title = `${def.icon} ${translation.getTranslation(descKey)}`;
    this.addText(title, { size: CHALLENGE_TITLE_SIZE }, { y: rowY, x: CHALLENGE_TITLE_X });

    if (completed) {
      const checkText = new Text({
        text: '✓',
        style: { fontFamily: 'DefaultFont', fontSize: CHALLENGE_TITLE_SIZE, fill: 0x44ff44 },
      });
      checkText.anchor.set(THE_MIDDLE, THE_MIDDLE);
      checkText.x = CHALLENGE_STATUS_X;
      checkText.y = rowY;
      this.addToContent(checkText);
    } else {
      const progressText = translation.getTranslation('daily.progress', {
        current: String(Math.min(progress, def.threshold)),
        total: String(def.threshold),
      });
      this.addText(progressText, { size: CHALLENGE_STATUS_SIZE }, { y: rowY, x: CHALLENGE_STATUS_X });
    }

    const rewardText = translation.getTranslation('daily.reward', { reward: String(def.reward) });
    this.addText(rewardText, { size: CHALLENGE_STATUS_SIZE }, { y: rowY + STATUS_LINE_OFFSET, x: CHALLENGE_TITLE_X });
  }
}
