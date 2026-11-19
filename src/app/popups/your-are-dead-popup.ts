import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';
import { createRunResult, handleShare } from './run-result';

const RESULT_POPUP_HEIGHT = 400;

export class YouAreDeadPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('youAreDead.title'), RESULT_POPUP_HEIGHT);

    const baseLost = gameService.baseDestroyed;
    this.addText(translation.getTranslation(baseLost ? 'youAreDead.baseSubtitle' : 'youAreDead.subtitle'), { size: 14 }, { y: -66 });
    this.addText(translation.getTranslation(baseLost ? 'youAreDead.baseMessage' : 'youAreDead.message'), { size: 12 }, { y: -38 });

    const result = createRunResult(gameService.lastRun, translation);
    result.y = -2;
    this.addToContent(result);

    /* eslint-disable no-magic-numbers */
    const share = this.addButton(translation.getTranslation('run.share'), () => handleShare(share, gameService.lastRun, translation), 4.2);
    this.addButton(translation.getTranslation('common.close'), () => gameService.endGame(this), 5.2);
    /* eslint-enable no-magic-numbers */
  }
}
