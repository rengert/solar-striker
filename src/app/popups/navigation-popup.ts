import { GameService } from '../services/game.service';
import { version } from '../version';
import { Popup } from './popup';

export class NavigationPopup extends Popup {
  constructor(gameService: GameService) {
    super('Solarstriker');

    this.addText(this.panel, `v. ${version.code}`, 11, 105);

    this.addButton('Spiel starten!', () => gameService.start(this), 0, this.panel);
    this.addButton('Credits!', () => gameService.openCredits(this), 1, this.panel);
  }
}
