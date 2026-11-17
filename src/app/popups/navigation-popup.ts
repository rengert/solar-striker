import { getPilotRank } from '../models/pilot-rank.model';
import { CURRENT_SEASON_EVENT } from '../models/season-event.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { version } from '../version';
import { BUTTON_SIZE, Popup } from './popup';

// eslint-disable-next-line no-magic-numbers
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAILY_SURPRISE_ICONS = ['✨', '🚀', '☄️'] as const;
const BUTTON_START_Y = -74;
const BUTTON_STEP_Y = 40;
const PANEL_PADDING = 120;
const BASE_BUTTON_COUNT = 9;
const EVENT_LABEL_HEIGHT = 20;
const EVENT_LABEL_OFFSET = 10;
const RANK_LABEL_HEIGHT = 20;
const RANK_LABEL_COLOR = 0x1a5fa0;
const RANK_LABEL_MAX_WIDTH = 230;

export function getDailySurpriseIcon(now: Date = new Date()): string {
  const daySinceEpoch = Math.floor(now.getTime() / DAY_IN_MS);
  const index = daySinceEpoch % DAILY_SURPRISE_ICONS.length;
  return DAILY_SURPRISE_ICONS[index];
}

/** Open missions as a count so players see at a glance that today still has rewards waiting. */
export function getDailyBadge(gameService: GameService): string {
  const open = gameService.dailyChallengeService.getToday().filter((entry) => !entry.completed).length;
  return open === 0 ? '✓' : `(${open})`;
}

export class NavigationPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    const savedStage = gameService.savedStage();
    const buttonCount = BASE_BUTTON_COUNT + (savedStage === null ? 0 : 1);
    super(
      `${translation.getTranslation('app.title')} ${CURRENT_SEASON_EVENT?.enemyIcons[0] ?? getDailySurpriseIcon()}`,
      BUTTON_START_Y + (buttonCount - 1) * BUTTON_STEP_Y + BUTTON_SIZE.height + PANEL_PADDING
      + (CURRENT_SEASON_EVENT ? EVENT_LABEL_HEIGHT : 0) + RANK_LABEL_HEIGHT,
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
        translation.getTranslation('navigation.campaign'),
        () => gameService.openCampaign(this),
        0,
      ),
    );
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
        `${translation.getTranslation('navigation.daily')} ${getDailyBadge(gameService)}`,
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
    const rank = getPilotRank(gameService.totalKills());
    const rankLabel = this.addText(
      translation.getTranslation(rank.killsToNext === undefined ? 'rank.labelMax' : 'rank.label', {
        rank: translation.getTranslation(`rank.${rank.id}`),
        kills: rank.killsToNext ?? 0,
      }),
      { size: 11, fill: RANK_LABEL_COLOR },
      { y: BUTTON_START_Y + buttonCount * BUTTON_STEP_Y + EVENT_LABEL_OFFSET },
    );
    // long rank names (French) must stay inside the panel
    rankLabel.scale.set(Math.min(1, RANK_LABEL_MAX_WIDTH / rankLabel.width));
    if (CURRENT_SEASON_EVENT) {
      const { name, enemyIcons } = CURRENT_SEASON_EVENT;
      this.addText(
        `${enemyIcons.join(' ')} ${translation.getTranslation(name)}`,
        { size: 12 },
        { y: BUTTON_START_Y + buttonCount * BUTTON_STEP_Y + EVENT_LABEL_OFFSET + RANK_LABEL_HEIGHT },
      );
    }
  }
}
