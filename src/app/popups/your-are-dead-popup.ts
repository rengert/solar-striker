import { LARGE_POP_UP_HEIGHT } from '../game-constants';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

export class YouAreDeadPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('youAreDead.title'), LARGE_POP_UP_HEIGHT);

    this.addText(translation.getTranslation('youAreDead.subtitle'), { size: 14 }, { y: -60 });
    this.addText(translation.getTranslation('youAreDead.message'), { size: 12 }, { y: -40 });
    this.addText(translation.getTranslation('youAreDead.points'), { size: 14 }, { y: -10 });
    // show kills padded to 7 digits
    const PADDED_DIGITS = 7;
    this.addText(gameService.kills().toString().padStart(PADDED_DIGITS, '0'), { size: 12 }, { y: 10 });
    this.addText(translation.getTranslation('youAreDead.sessionCoins'), { size: 14 }, { y: 40 });
    this.addText(gameService.sessionCoins().toString().padStart(PADDED_DIGITS, '0'), { size: 12 }, { y: 60 });

    // show highest combo achieved this session
    this.addText('Highest combo', { size: 14 }, { y: 90 });
    this.addText(gameService.highestCombo().toString(), { size: 12 }, { y: 110 });

    // eslint-disable-next-line no-magic-numbers
    this.addButton(translation.getTranslation('common.close'), () => gameService.endGame(this), 3);
  }
}
