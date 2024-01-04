import dayjs from 'dayjs';
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

    this.addText(this.panel, 'Datum', { size: 12 }, { y: -60, x: -60 });
    this.addText(this.panel, 'Kills', { size: 12 }, { y: -60, x: 35 });
    this.addText(this.panel, 'Level', { size: 12 }, { y: -60, x: 100 });

    for (let i = 1; i <= Math.min(highscore.length, 5); i++) {
      const dataSet = highscore[i];
      const date = new Date(dataSet.date);
      const dateString = dayjs(date).format('DD.MM.YYYY HH:mm');
      this.addText(this.panel, dateString, { size: 12 }, { y: -60 + i * 20, x: -60 });
      this.addText(this.panel, dataSet.kills.toString(), { size: 12 }, { y: -60 + i * 20, x: 35 });
      this.addText(this.panel, dataSet.level.toString(), { size: 12 }, { y: -60 + i * 20, x: 100 });
    }

    await super.show();
  }
}
