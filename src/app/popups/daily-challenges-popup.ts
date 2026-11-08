import { Text } from 'pixi.js';
import { THE_MIDDLE } from '../game-constants';
import { getWeeklyChallenge } from '../models/weekly-challenge.model';
import { DailyChallengeEntry } from '../services/daily-challenge.service';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 330;
const CHALLENGE_START_Y = -60;
const CHALLENGE_ROW_SPACING = 42;
const CHALLENGE_TITLE_X = -115;
const CHALLENGE_STATUS_X = 115;
const CHALLENGE_TITLE_SIZE = 10;
const ALIGN_LEFT = 0;
const ALIGN_RIGHT = 1;
const CHALLENGE_STATUS_SIZE = 9;
const STATUS_LINE_OFFSET = 18;
const WEEKLY_TITLE_Y = 70;
const WEEKLY_RULE_Y = 88;
const WEEKLY_BUTTON_Y = 102;
const BACK_BUTTON_Y = 156;
const WEEKLY_COLOR = 0x1166cc;

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

    const weekly = getWeeklyChallenge();
    this.addText(
      translation.getTranslation('weekly.title', { level: weekly.stage }),
      { size: CHALLENGE_TITLE_SIZE, fill: WEEKLY_COLOR },
      { y: WEEKLY_TITLE_Y },
    );
    this.addText(`${weekly.icon} ${translation.getTranslation(weekly.ruleKey)}`, { size: CHALLENGE_TITLE_SIZE }, { y: WEEKLY_RULE_Y });
    this.addButton(translation.getTranslation('weekly.start'), () => gameService.startWeekly(this), 0).button.y = WEEKLY_BUTTON_Y;
    this.addButton(translation.getTranslation('common.back'), () => gameService.openNavigation(this), 0).button.y = BACK_BUTTON_Y;
  }

  private addChallengeRow({ entry, translation, rowY }: ChallengeRowContext): void {
    const { def, progress, completed } = entry;
    const descKey = `daily.${def.id}.description` as Parameters<typeof translation.getTranslation>[0];
    const title = `${def.icon} ${translation.getTranslation(descKey)}`;
    this.addText(title, { size: CHALLENGE_TITLE_SIZE, anchorX: ALIGN_LEFT }, { y: rowY, x: CHALLENGE_TITLE_X });

    if (completed) {
      const checkText = new Text({
        text: '✓',
        style: { fontFamily: 'DefaultFont', fontSize: CHALLENGE_TITLE_SIZE, fill: 0x44ff44 },
      });
      checkText.anchor.set(ALIGN_RIGHT, THE_MIDDLE);
      checkText.x = CHALLENGE_STATUS_X;
      checkText.y = rowY + STATUS_LINE_OFFSET;
      this.addToContent(checkText);
    } else {
      const progressText = translation.getTranslation('daily.progress', {
        current: String(Math.min(progress, def.threshold)),
        total: String(def.threshold),
      });
      this.addText(
        progressText,
        { size: CHALLENGE_STATUS_SIZE, anchorX: ALIGN_RIGHT },
        { y: rowY + STATUS_LINE_OFFSET, x: CHALLENGE_STATUS_X },
      );
    }

    const rewardText = translation.getTranslation('daily.reward', { reward: String(def.reward) });
    this.addText(
      rewardText,
      { size: CHALLENGE_STATUS_SIZE, anchorX: ALIGN_LEFT },
      { y: rowY + STATUS_LINE_OFFSET, x: CHALLENGE_TITLE_X },
    );
  }
}
