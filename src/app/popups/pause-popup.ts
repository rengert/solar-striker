import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

export class PausePopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('game.pause'));

    this.addButton(
      translation.getTranslation('game.resume'),
      () => gameService.resume(this),
      0,
    );
  }
}
