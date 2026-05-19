import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { version } from '../version';
import { Popup } from './popup';

const POPUP_HEIGHT = 460;
// eslint-disable-next-line no-magic-numbers
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAILY_SURPRISE_ICONS = ['✨', '🚀', '☄️'] as const;
const BUTTON_START_Y = -74;
const BUTTON_STEP_Y = 42;

export function getDailySurpriseIcon(now: Date = new Date()): string {
  const daySinceEpoch = Math.floor(now.getTime() / DAY_IN_MS);
  const index = daySinceEpoch % DAILY_SURPRISE_ICONS.length;
  return DAILY_SURPRISE_ICONS[index];
}

export class NavigationPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(`${translation.getTranslation('app.title')} ${getDailySurpriseIcon()}`, POPUP_HEIGHT);
    const buttons = [];
    const savedStage = gameService.savedStage();

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
        translation.getTranslation('navigation.credits'),
        () => gameService.openCredits(this),
        0,
      ),
    );

    buttons.forEach(({ button }, index) => {
      button.y = BUTTON_START_Y + index * BUTTON_STEP_Y;
    });
  }
}
