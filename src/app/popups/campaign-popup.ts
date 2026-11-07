import { MAX_STAGE } from '../game-constants';
import { getChapterTitle, STAGES_PER_CHAPTER, STORY_CHAPTERS } from '../models/story.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 355;
const PROGRESS_Y = -66;
const START_Y = -38;
const ROW_SPACING = 23;
const ICON_X = -108;
const TITLE_X = -92;
const STATUS_X = 112;
const ROW_SIZE = 11;
const PROGRESS_SIZE = 12;
const ALIGN_LEFT = 0;
const ALIGN_RIGHT = 1;
const CURRENT_COLOR = 0x1166cc;
const LOCKED_ALPHA = 0.55;
const BACK_BUTTON_Y = 196;

/** Chapters of the story with what the player has cleared so far. */
export class CampaignPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('campaign.title'), POPUP_HEIGHT);

    const cleared = gameService.clearedStage();
    this.addText(
      translation.getTranslation('campaign.progress', { level: cleared, total: MAX_STAGE }),
      { size: PROGRESS_SIZE },
      { y: PROGRESS_Y },
    );

    STORY_CHAPTERS.forEach(({ icon }, index) => {
      const firstStage = index * STAGES_PER_CHAPTER;
      const done = Math.min(STAGES_PER_CHAPTER, Math.max(0, cleared - firstStage));
      const unlocked = cleared >= firstStage;
      const current = unlocked && done < STAGES_PER_CHAPTER;
      const y = START_Y + index * ROW_SPACING;
      const fill = current ? CURRENT_COLOR : undefined;
      const title = unlocked ? translation.getTranslation(getChapterTitle(index + 1)) : translation.getTranslation('campaign.locked');
      let status = unlocked ? '✓' : '🔒';
      if (current) {
        status = `${done}/${STAGES_PER_CHAPTER}`;
      }

      const texts = [
        this.addText(unlocked ? icon : '•', { size: ROW_SIZE }, { y, x: ICON_X }),
        this.addText(`${index + 1}. ${title}`, { size: ROW_SIZE, anchorX: ALIGN_LEFT, fill }, { y, x: TITLE_X }),
        this.addText(status, { size: ROW_SIZE, anchorX: ALIGN_RIGHT, fill }, { y, x: STATUS_X }),
      ];
      texts.forEach((text) => (text.alpha = unlocked ? 1 : LOCKED_ALPHA));
    });

    const back = this.addButton(translation.getTranslation('common.back'), () => gameService.openNavigation(this), 0);
    back.button.y = BACK_BUTTON_Y;
  }
}
