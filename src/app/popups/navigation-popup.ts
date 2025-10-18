import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { version } from '../version';
import { Popup } from './popup';

const POPUP_HEIGHT = 250;

export class NavigationPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('app.title'), POPUP_HEIGHT);

    const buttonIndex = {
      start: 0,
      hangar: 1,
      highscore: 2,
      credits: 4,
      settings: 3,
    } as const;

    this.addText(
      translation.getTranslation('app.version', { version: version.code }),
      { size: 11, rotated: true },
      { y: 135, x: 120 },
    );
    this.addButton(
      translation.getTranslation('navigation.settings'),
      () => gameService.openSettings(this),
      buttonIndex.settings,
    );

    this.addButton(
      translation.getTranslation('navigation.start'),
      () => gameService.start(this),
      buttonIndex.start,
    );
    this.addButton(
      translation.getTranslation('navigation.hangar'),
      () => gameService.openHangar(this),
      buttonIndex.hangar,
    );
    this.addButton(
      translation.getTranslation('navigation.highscore'),
      () => gameService.openHighscore(this),
      buttonIndex.highscore,
    );

    this.addButton(
      translation.getTranslation('navigation.credits'),
      () => gameService.openCredits(this),
      buttonIndex.credits,
    );
  }
}
