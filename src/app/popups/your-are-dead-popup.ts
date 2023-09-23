import { GameService } from '../services/game.service';
import { Popup } from './popup';

export class YouAreDeadPopup extends Popup {
  constructor(gameService: GameService) {
    super('Credits');

    this.addText(this.panel, 'Du bist gestorben', 14, -60);
    this.addText(this.panel, 'Du bist leider unterlegen\n\t und der Kampf ist vorbei', 12, -40);
    this.addText(this.panel, 'Punkte', 14, -10);
    this.addText(this.panel, gameService.kills.value.toString(), 12, 10);
    
    this.addButton('Schließen!', () => gameService.endGame(this), 2, this.panel);
  }
}