import dayjs from 'dayjs';
import { GameService } from '../services/game.service';
import { StorageService } from '../services/storage.service';
import { Popup } from './popup';

export class HighscorePopup extends Popup {
  private readonly storage: StorageService = new StorageService();

  constructor(gameService: GameService) {
    super('Highscore', 420);

    this.addButton('Schließen!', () => gameService.openNavigation(this), 5);
  }

  override async show(): Promise<void> {
    const highscore = await this.storage.getHighscore();
    highscore.sort((a, b) => b.kills - a.kills);

    this.addText('Datum', { size: 12 }, { y: -60, x: -90 });
    this.addText('Kills', { size: 12 }, { y: -60, x: 35 });
    this.addText('Level', { size: 12 }, { y: -60, x: 100 });

    for (let i = 1; i <= Math.min(highscore.length, 7); i++) {
      const dataSet = highscore[i - 1];
      const date = new Date(dataSet.date);
      const dateString = dayjs(date).format('DD.MM.YYYY HH:mm');
      this.addText(dateString, { size: 12 }, { y: -60 + i * 20, x: -60 });
      this.addText(dataSet.kills.toString(), { size: 12 }, { y: -60 + i * 20, x: 35 });
      this.addText(dataSet.level.toString(), { size: 12 }, { y: -60 + i * 20, x: 100 });
    }

    await super.show();
  }
}
