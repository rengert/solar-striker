import { GameService } from '../services/game.service';
import { Popup } from './popup';

export class CreditsPopup extends Popup {
  constructor(gameService: GameService) {
    super('Credits');

    this.addText(this.panel, 'Idee & Programmierung', { size: 14 }, { y: -60 });
    this.addText(this.panel, 'Thomas Renger', { size: 12 }, { y: -40 });
    this.addText(this.panel, 'Grafiken', { size: 14 }, { y: -10 });
    this.addText(this.panel, 'Kenney (www.kenney.nl)', { size: 12 }, { y: 10 });

    this.addButton('Schließen!', () => gameService.openNavigation(this), 2, this.panel);
  }
}
