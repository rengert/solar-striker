import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';
import { createRunResult } from './run-result';

const RESULT_POPUP_HEIGHT = 360;

export class VictoryPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('victory.title'), RESULT_POPUP_HEIGHT);

    this.addText(translation.getTranslation('victory.subtitle'), { size: 14 }, { y: -66 });
    this.addText(translation.getTranslation('victory.message'), { size: 12 }, { y: -38 });

    const result = createRunResult(gameService.lastRun, translation);
    result.y = -2;
    this.addToContent(result);

    // eslint-disable-next-line no-magic-numbers
    this.addButton(translation.getTranslation('common.close'), () => gameService.endGame(this), 4.5);
  }
}
