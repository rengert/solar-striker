import { AchievementDefinition, ACHIEVEMENTS, AchievementState } from '../models/achievement.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const ACHIEVEMENT_POPUP_HEIGHT = 445;
const ACHIEVEMENT_ROW_SPACING = 23;
const ACHIEVEMENT_START_Y = -65;
const ACHIEVEMENT_DESCRIPTION_OFFSET = 10;
const ACHIEVEMENT_TITLE_X = -115;
const ACHIEVEMENT_STATUS_X = 115;
const ALIGN_LEFT = 0;
const ALIGN_RIGHT = 1;
const ACHIEVEMENT_LABEL_SIZE = 10;
const DESCRIPTION_LABEL_SIZE = 8;
const DESCRIPTION_COLOR = 0x444444;
const LOCKED_ALPHA = 0.55;
const CLOSE_BUTTON_INDEX = 6.5;
const PROGRESS_LABEL_SIZE = 9;

interface AchievementRowContext {
  def: AchievementDefinition;
  state: AchievementState;
  translation: TranslationService;
  rowY: number;
}

export class AchievementsPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    const states = gameService.achievementService.getAll();
    const unlocked = states.filter((state) => state.unlocked).length;
    super(`${translation.getTranslation('achievements.title')} ${unlocked}/${states.length}`, ACHIEVEMENT_POPUP_HEIGHT);

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
    type Key = Parameters<typeof translation.getTranslation>[0];
    const title = `${def.icon} ${translation.getTranslation(`achievement.${def.id}.title` as Key)}`;
    const alpha = state.unlocked ? 1 : LOCKED_ALPHA;
    this.addText(title, { size: ACHIEVEMENT_LABEL_SIZE, anchorX: ALIGN_LEFT }, { y: rowY, x: ACHIEVEMENT_TITLE_X }).alpha = alpha;
    this.addText(
      translation.getTranslation(`achievement.${def.id}.description` as Key),
      { size: DESCRIPTION_LABEL_SIZE, anchorX: ALIGN_LEFT, fill: DESCRIPTION_COLOR },
      { y: rowY + ACHIEVEMENT_DESCRIPTION_OFFSET, x: ACHIEVEMENT_TITLE_X },
    ).alpha = alpha;

    if (state.unlocked) {
      this.addText('✓', { size: ACHIEVEMENT_LABEL_SIZE, anchorX: ALIGN_RIGHT }, { y: rowY, x: ACHIEVEMENT_STATUS_X });
    } else if (def.cumulative) {
      const progressText = translation.getTranslation('achievements.progress', {
        current: String(state.progress),
        total: String(def.threshold),
      });
      this.addText(progressText, { size: PROGRESS_LABEL_SIZE, anchorX: ALIGN_RIGHT }, { y: rowY, x: ACHIEVEMENT_STATUS_X });
    } else {
      this.addText('—', { size: ACHIEVEMENT_LABEL_SIZE, anchorX: ALIGN_RIGHT }, { y: rowY, x: ACHIEVEMENT_STATUS_X });
    }
  }
}
