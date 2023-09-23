import { GameService } from '../services/game.service';
import { Popup } from './popup';

export class YouAreDeadPopup extends Popup {
  constructor(gameService: GameService) {
    super('Credits');

    this.addText(this.panel, 'Du bist gestorben', { size: 14 }, { y: -60 });
    this.addText(this.panel, 'Du bist leider unterlegen\n\t und der Kampf ist vorbei', { size: 12 }, { y: -40 });
    this.addText(this.panel, 'Punkte', { size: 14 }, { y: -10 });
    this.addText(this.panel, gameService.kills.value.toString(), { size: 12 }, { y: 10 });

    this.addButton('Schließen!', () => gameService.endGame(this), 2, this.panel);
  }
}
