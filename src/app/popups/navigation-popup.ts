import { PixiGameService } from '../services/pixi-game.service';
import { Popup } from './popup';

export class NavigationPopup extends Popup {
  constructor(gameService: PixiGameService) {
    super('Solarstriker');

    this.addButton('Spiel starten!', () => gameService.start(this), 0, this.panel);
    this.addButton('Credits!', () => gameService.openCredits(this), 1, this.panel);
  }
}
