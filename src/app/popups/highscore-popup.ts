import { GameService } from '../services/game.service';
import { StorageService } from '../services/storage.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

export class HighscorePopup extends Popup {
  private readonly storage: StorageService = new StorageService();

  constructor(gameService: GameService, private readonly translation: TranslationService) {
    // eslint-disable-next-line no-magic-numbers
    super(translation.getTranslation('highscore.title'), 420);

    // eslint-disable-next-line no-magic-numbers
    this.addButton(translation.getTranslation('common.close'), () => gameService.openNavigation(this), 5);
  }

  override async show(): Promise<void> {
    const highscore = await this.storage.getHighscore();
    highscore.sort((a, b) => b.kills - a.kills);

    this.addText(this.translation.getTranslation('highscore.date'), { size: 12 }, { y: -60, x: -90 });
    this.addText(this.translation.getTranslation('highscore.kills'), { size: 12 }, { y: -60, x: 35 });
    this.addText(this.translation.getTranslation('highscore.level'), { size: 12 }, { y: -60, x: 100 });

    const dateFormatter = new Intl.DateTimeFormat(this.translation.locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    // eslint-disable-next-line no-magic-numbers
    for (let i = 1; i <= Math.min(highscore.length, 7); i++) {
      const dataSet = highscore[i - 1];
      const date = new Date(dataSet.date);
      const dateString = dateFormatter.format(date);
      // eslint-disable-next-line no-magic-numbers
      this.addText(dateString, { size: 12 }, { y: -60 + i * 20, x: -60 });
      // eslint-disable-next-line no-magic-numbers
      this.addText(dataSet.kills.toString(), { size: 12 }, { y: -60 + i * 20, x: 35 });
      // eslint-disable-next-line no-magic-numbers
      this.addText(dataSet.level.toString(), { size: 12 }, { y: -60 + i * 20, x: 100 });
    }

    await super.show();
  }
}
