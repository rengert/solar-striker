import { CURRENT_SEASON_EVENT } from '../models/season-event.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { version } from '../version';
import { Popup } from './popup';

// eslint-disable-next-line no-magic-numbers
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAILY_SURPRISE_ICONS = ['✨', '🚀', '☄️'] as const;
const BUTTON_START_Y = -74;
const BUTTON_STEP_Y = 50;
const BUTTON_HEIGHT = 49;
const PANEL_PADDING = 135;
const BASE_BUTTON_COUNT = 8;
const EVENT_LABEL_HEIGHT = 20;
const EVENT_LABEL_OFFSET = 10;

export function getDailySurpriseIcon(now: Date = new Date()): string {
  const daySinceEpoch = Math.floor(now.getTime() / DAY_IN_MS);
  const index = daySinceEpoch % DAILY_SURPRISE_ICONS.length;
  return DAILY_SURPRISE_ICONS[index];
}

export class NavigationPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    const savedStage = gameService.savedStage();
    const buttonCount = BASE_BUTTON_COUNT + (savedStage === null ? 0 : 1);
    super(
      `${translation.getTranslation('app.title')} ${CURRENT_SEASON_EVENT?.enemyIcons[0] ?? getDailySurpriseIcon()}`,
      BUTTON_START_Y + (buttonCount - 1) * BUTTON_STEP_Y + BUTTON_HEIGHT + PANEL_PADDING
      + (CURRENT_SEASON_EVENT ? EVENT_LABEL_HEIGHT : 0),
    );
    const buttons = [];

    this.addText(
      translation.getTranslation('app.version', { version: version.code }),
      { size: 11, rotated: true },
      { y: 135, x: 120 },
    );
    if (savedStage !== null) {
      buttons.push(
        this.addButton(
          translation.getTranslation('navigation.continue', { level: savedStage }),
          () => gameService.continueFromCheckpoint(this),
          0,
        ),
      );
      buttons.push(
        this.addButton(
          translation.getTranslation('navigation.restart'),
          () => gameService.start(this),
          0,
        ),
      );
    } else {
      buttons.push(this.addButton(translation.getTranslation('navigation.start'), () => gameService.start(this), 0));
    }

    buttons.push(
      this.addButton(
        translation.getTranslation('navigation.hangar'),
        () => gameService.openHangar(this),
        0,
      ),
    );
    buttons.push(
      this.addButton(
        translation.getTranslation('navigation.highscore'),
        () => gameService.openHighscore(this),
        0,
      ),
    );
    buttons.push(
      this.addButton(
        translation.getTranslation('navigation.settings'),
        () => gameService.openSettings(this),
        0,
      ),
    );
    buttons.push(
      this.addButton(
        translation.getTranslation('navigation.achievements'),
        () => gameService.openAchievements(this),
        0,
      ),
    );
    buttons.push(
      this.addButton(
        translation.getTranslation('navigation.daily'),
        () => gameService.openDailyChallenges(this),
        0,
      ),
    );
    buttons.push(
      this.addButton(
        translation.getTranslation('navigation.library'),
        () => gameService.openLibrary(this),
        0,
      ),
    );
    buttons.push(
      this.addButton(
        translation.getTranslation('navigation.credits'),
        () => gameService.openCredits(this),
        0,
      ),
    );

    buttons.forEach(({ button }, index) => {
      button.y = BUTTON_START_Y + index * BUTTON_STEP_Y;
    });
    if (CURRENT_SEASON_EVENT) {
      const { name, enemyIcons } = CURRENT_SEASON_EVENT;
      this.addText(
        `${enemyIcons.join(' ')} ${translation.getTranslation(name)}`,
        { size: 12 },
        { y: BUTTON_START_Y + buttonCount * BUTTON_STEP_Y + EVENT_LABEL_OFFSET },
      );
    }
  }
}
