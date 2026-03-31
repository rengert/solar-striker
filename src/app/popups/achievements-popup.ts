import { AchievementDefinition, ACHIEVEMENTS, AchievementState } from '../models/achievement.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const ACHIEVEMENT_POPUP_HEIGHT = 420;
const ACHIEVEMENT_ROW_SPACING = 17;
const ACHIEVEMENT_START_Y = -65;
const ACHIEVEMENT_TITLE_X = -80;
const ACHIEVEMENT_STATUS_X = 95;
const ACHIEVEMENT_LABEL_SIZE = 10;
const CLOSE_BUTTON_INDEX = 5;
const PROGRESS_LABEL_SIZE = 9;

interface AchievementRowContext {
  def: AchievementDefinition;
  state: AchievementState;
  translation: TranslationService;
  rowY: number;
}

export class AchievementsPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('achievements.title'), ACHIEVEMENT_POPUP_HEIGHT);

    const states = gameService.achievementService.getAll();

    for (let i = 0; i < ACHIEVEMENTS.length; i++) {
      const rowY = ACHIEVEMENT_START_Y + i * ACHIEVEMENT_ROW_SPACING;
      this.addAchievementRow({ def: ACHIEVEMENTS[i], state: states[i], translation, rowY });
    }

    this.addButton(
      translation.getTranslation('common.back'),
      () => gameService.openNavigation(this),
      CLOSE_BUTTON_INDEX,
    );
  }

  private addAchievementRow({ def, state, translation, rowY }: AchievementRowContext): void {
    const titleKey = `achievement.${def.id}.title` as Parameters<typeof translation.getTranslation>[0];
    const title = `${def.icon} ${translation.getTranslation(titleKey)}`;
    this.addText(title, { size: ACHIEVEMENT_LABEL_SIZE }, { y: rowY, x: ACHIEVEMENT_TITLE_X });

    if (state.unlocked) {
      this.addText('✓', { size: ACHIEVEMENT_LABEL_SIZE }, { y: rowY, x: ACHIEVEMENT_STATUS_X });
    } else if (def.cumulative) {
      const progressText = translation.getTranslation('achievements.progress', {
        current: String(state.progress),
        total: String(def.threshold),
      });
      this.addText(progressText, { size: PROGRESS_LABEL_SIZE }, { y: rowY, x: ACHIEVEMENT_STATUS_X });
    } else {
      this.addText('—', { size: ACHIEVEMENT_LABEL_SIZE }, { y: rowY, x: ACHIEVEMENT_STATUS_X });
    }
  }
}
