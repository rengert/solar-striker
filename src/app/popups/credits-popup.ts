import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

// absolute so it also works from the native apps; the stores link the same page as privacy policy
const LEGAL_URL = 'https://rengert.github.io/solar-striker/rechtliches.html';

export class CreditsPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    // eslint-disable-next-line no-magic-numbers
    super(translation.getTranslation('credits.title'), 280);

    this.addText(translation.getTranslation('credits.ideaProgramming'), { size: 14 }, { y: -60 });
    this.addText(translation.getTranslation('credits.authorName'), { size: 12 }, { y: -40 });
    this.addText(translation.getTranslation('credits.graphics'), { size: 14 }, { y: -10 });
    this.addText(translation.getTranslation('credits.artAttribution'), { size: 12 }, { y: 10 });

    // eslint-disable-next-line no-magic-numbers
    this.addButton(translation.getTranslation('credits.legal'), () => window.open(LEGAL_URL, '_blank', 'noopener'), 2);
    // eslint-disable-next-line no-magic-numbers
    this.addButton(translation.getTranslation('common.close'), () => gameService.openNavigation(this), 3);
  }
}
