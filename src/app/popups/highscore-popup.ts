import { GameService } from '../services/game.service';
import { StorageService } from '../services/storage.service';
import { Popup } from './popup';

export class HighscorePopup extends Popup {
  private readonly storage: StorageService = new StorageService();

  constructor(gameService: GameService) {
    super('Highscore');

    this.addButton('Schließen!', () => gameService.openNavigation(this), 2, this.panel);
  }

  override async show(): Promise<void> {
    const highscore = await this.storage.getHighscore();
    highscore.sort((a, b) => b.kills - a.kills);
    for (let i = 0; i < Math.min(highscore.length, 5); i++) {
      const dataSet = highscore[i];
      const date = new Date(dataSet.date);
      const dateString = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
      this.addText(this.panel, dateString, { size: 12 }, { y: -60 + i * 20, x: -60 });
      this.addText(this.panel, dataSet.kills.toString(), { size: 12 }, { y: -60 + i * 20, x: 25 });
      this.addText(this.panel, dataSet.level.toString(), { size: 12 }, { y: -60 + i * 20, x: 75 });
    }

    await super.show();
  }
}
