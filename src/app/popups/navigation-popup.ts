import { GameService } from '../services/game.service';
import { version } from '../version';
import { Popup } from './popup';

export class NavigationPopup extends Popup {
  constructor(gameService: GameService) {
    super('Solarstriker');

    this.addText(`Version. ${version.code}`, { size: 11, rotated: true }, { y: 60, x: 120 });

    this.addButton('Spiel starten!', () => gameService.start(this), 0);
    this.addButton('Highscore', () => gameService.openHighscore(this), 1);
    this.addButton('Credits', () => gameService.openCredits(this), 2);
  }
}
