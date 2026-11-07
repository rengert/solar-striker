import { Assets, Sprite, Spritesheet } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { LIBRARY_ENEMIES, LIBRARY_POWER_UPS } from '../models/library.model';
import { TranslationKey } from '../i18n/translations';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 430;
const START_Y = -62;
const ROW_SPACING = 28;
const DESCRIPTION_OFFSET_Y = 11;
const ICON_X = -108;
const TEXT_X = -92;
const ICON_SIZE = 18;
const ICON_OFFSET_Y = 5;
const EMOJI_SIZE = 14;
const TITLE_SIZE = 10;
const DESCRIPTION_SIZE = 8;
const ALIGN_LEFT = 0;
const SWITCH_BUTTON_Y = 198;
const BACK_BUTTON_Y = 250;
const CENTER = 0.5;

interface LibraryRow {
  key: string;
  icon: string | Sprite;
}

/** Codex of all power-ups; LibraryEnemiesPopup shows the enemies. */
export class LibraryPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService, enemies = false) {
    super(translation.getTranslation(enemies ? 'library.enemiesTitle' : 'library.powerUpsTitle'), POPUP_HEIGHT);

    const rows: LibraryRow[] = enemies
      ? LIBRARY_ENEMIES.map(({ id, icon }) => ({ key: `library.enemy.${id}`, icon }))
      : LIBRARY_POWER_UPS.map((type) => ({ key: `library.powerUp.${type}`, icon: this.createPowerUpIcon(type) }));

    rows.forEach((row, index) => this.addRow(row, START_Y + index * ROW_SPACING, translation));

    const switchButton = this.addButton(
      translation.getTranslation(enemies ? 'library.showPowerUps' : 'library.showEnemies'),
      () => gameService.openLibrary(this, !enemies),
      0,
    );
    switchButton.button.y = SWITCH_BUTTON_Y;
    const backButton = this.addButton(translation.getTranslation('common.back'), () => gameService.openNavigation(this), 0);
    backButton.button.y = BACK_BUTTON_Y;
  }

  private addRow({ key, icon }: LibraryRow, y: number, translation: TranslationService): void {
    if (typeof icon === 'string') {
      this.addText(icon, { size: EMOJI_SIZE }, { y: y + ICON_OFFSET_Y, x: ICON_X });
    } else {
      icon.position.set(ICON_X, y + ICON_OFFSET_Y);
      this.addToContent(icon);
    }
    this.addText(translation.getTranslation(`${key}.title` as TranslationKey), { size: TITLE_SIZE, anchorX: ALIGN_LEFT }, { y, x: TEXT_X });
    this.addText(
      translation.getTranslation(`${key}.description` as TranslationKey),
      { size: DESCRIPTION_SIZE, anchorX: ALIGN_LEFT },
      { y: y + DESCRIPTION_OFFSET_Y, x: TEXT_X },
    );
  }

  /** First frame of the in-game sprite, tinted like the drop, so players recognise it. */
  private createPowerUpIcon(type: string): string | Sprite {
    // last config wins, matching which animation GameCollectableService keeps per type
    const config = GAME_CONFIG.powerUpConfig.findLast((entry) => entry.type === type);
    const sheet = config ? Assets.get<Spritesheet | undefined>(config.assetUrl) : undefined;
    const texture = config ? sheet?.animations[config.animationName]?.[0] : undefined;
    if (!config || !texture) {
      return '✦';
    }
    const sprite = new Sprite(texture);
    sprite.anchor.set(CENTER);
    sprite.scale.set(ICON_SIZE / Math.max(texture.width, texture.height));
    sprite.tint = config.tint ?? sprite.tint;
    return sprite;
  }
}

export class LibraryEnemiesPopup extends LibraryPopup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(gameService, translation, true);
  }
}
