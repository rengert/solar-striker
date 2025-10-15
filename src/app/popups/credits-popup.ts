import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

export class CreditsPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('credits.title'));

    this.addText(translation.getTranslation('credits.ideaProgramming'), { size: 14 }, { y: -60 });
    this.addText(translation.getTranslation('credits.authorName'), { size: 12 }, { y: -40 });
    this.addText(translation.getTranslation('credits.graphics'), { size: 14 }, { y: -10 });
    this.addText(translation.getTranslation('credits.artAttribution'), { size: 12 }, { y: 10 });

    // eslint-disable-next-line no-magic-numbers
    this.addButton(translation.getTranslation('common.close'), () => gameService.openNavigation(this), 2);
  }
}
