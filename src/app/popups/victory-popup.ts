import { LARGE_POP_UP_HEIGHT } from '../game-constants';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

export class VictoryPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('victory.title'), LARGE_POP_UP_HEIGHT);

    this.addText(translation.getTranslation('victory.subtitle'), { size: 14 }, { y: -60 });
    this.addText(translation.getTranslation('victory.message'), { size: 12 }, { y: -35 });
    this.addText(translation.getTranslation('victory.points'), { size: 14 }, { y: 10 });
    const PADDED_DIGITS = 7;
    this.addText(gameService.kills().toString().padStart(PADDED_DIGITS, '0'), { size: 12 }, { y: 30 });
    this.addText(translation.getTranslation('victory.sessionCoins'), { size: 14 }, { y: 60 });
    this.addText(gameService.sessionCoins().toString().padStart(PADDED_DIGITS, '0'), { size: 12 }, { y: 80 });

    // eslint-disable-next-line no-magic-numbers
    this.addButton(translation.getTranslation('common.close'), () => gameService.endGame(this), 3);
  }
}
