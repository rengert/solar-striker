import { GameService } from '../services/game.service';
import { Popup } from './popup';

export class CreditsPopup extends Popup {
  constructor(gameService: GameService) {
    super('Credits');

    this.addText(this.panel, 'Idee & Programmierung', 14, -60);
    this.addText(this.panel, 'Thomas Renger', 12, -40);
    this.addText(this.panel, 'Grafiken', 14, -10);
    this.addText(this.panel, 'Kenney (www.kenney.nl)', 12, 10);
    
    this.addButton('Schließen!', () => gameService.openNavigation(this), 2, this.panel);
  }
}
