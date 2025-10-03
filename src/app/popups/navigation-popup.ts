import { GameService } from '../services/game.service';
import { version } from '../version';
import { Popup } from './popup';

export class NavigationPopup extends Popup {
  constructor(gameService: GameService) {
    super('Solarstriker');

    const buttonIndex = {
      start: 0,
      hangar: 1,
      highscore: 2,
      credits: 3,
    } as const;

    this.addText(`Version. ${version.code}`, { size: 11, rotated: true }, { y: 60, x: 120 });

    this.addButton('Spiel starten!', () => gameService.start(this), buttonIndex.start);
    this.addButton('Hangar', () => gameService.openHangar(this), buttonIndex.hangar);
    this.addButton('Highscore', () => gameService.openHighscore(this), buttonIndex.highscore);
    this.addButton('Credits', () => gameService.openCredits(this), buttonIndex.credits);
  }
}
