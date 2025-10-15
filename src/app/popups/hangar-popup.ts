import { ButtonContainer } from '@pixi/ui';
import { Container, Sprite, Text, Texture } from 'pixi.js';
import { ShipUpgradeDefinition, ShipUpgradeType } from '../models/ship-upgrade.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 454;
const HALF = 0.5;
const ROW_START_Y = -50;
const ROW_VERTICAL_SPACING = 105;
const ROW_TITLE_X = -110;
const DESCRIPTION_Y = 12;
const LEVEL_LABEL_Y = 32;
const COST_LABEL_Y = 50;
const BUTTON_X = 0;
const BUTTON_Y = 60;
const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 30;
const BACK_BUTTON_OFFSET = 2;

interface UpgradeRow {
  definition: ShipUpgradeDefinition;
  levelText: Text;
  costText: Text;
  button: ButtonContainer;
}

export class HangarPopup extends Popup {
  private readonly upgradeRows = new Map<ShipUpgradeType, UpgradeRow>();

  constructor(
    private readonly gameService: GameService,
    private readonly translation: TranslationService,
  ) {
    super(translation.getTranslation('hangar.title'), POPUP_HEIGHT);

    this.y = -100;

    this.gameService.shipUpgrades.definitions.forEach((definition, index) => {
      const row = this.createUpgradeRow(definition, index);
      this.upgradeRows.set(definition.type, row);
    });

    const backButtonIndex = this.gameService.shipUpgrades.definitions.length + BACK_BUTTON_OFFSET;
    const button = this.addButton(
      this.translation.getTranslation('common.back'),
      () => this.gameService.openNavigation(this),
      backButtonIndex,
    );
    button.y = button.y + BUTTON_HEIGHT;
    this.updateView();
  }

  private createUpgradeRow(definition: ShipUpgradeDefinition, index: number): UpgradeRow {
    const rowContainer = new Container();
    rowContainer.y = ROW_START_Y + index * ROW_VERTICAL_SPACING;
    this.addToContent(rowContainer);

    const title = new Text({
      text: this.translation.getTranslation(definition.titleKey),
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 14,
        fill: 0x3c2f1e,
      },
    });
    title.anchor.set(0, HALF);
    title.x = ROW_TITLE_X;
    title.y = 0;
    rowContainer.addChild(title);

    const description = new Text({
      text: this.translation.getTranslation(definition.descriptionKey),
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 10,
        fill: 0x3c2f1e,
        wordWrap: true,
        wordWrapWidth: 200,
      },
    });
    description.anchor.set(0, 0);
    description.x = ROW_TITLE_X;
    description.y = DESCRIPTION_Y;
    rowContainer.addChild(description);

    const levelText = new Text({
      text: '',
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 12,
        fill: 0x3c2f1e,
      },
    });
    levelText.anchor.set(0, HALF);
    levelText.x = ROW_TITLE_X;
    levelText.y = LEVEL_LABEL_Y;
    rowContainer.addChild(levelText);

    const costText = new Text({
      text: '',
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 12,
        fill: 0x3c2f1e,
      },
    });
    costText.anchor.set(0, HALF);
    costText.x = ROW_TITLE_X;
    costText.y = COST_LABEL_Y;
    rowContainer.addChild(costText);

    const button = new ButtonContainer(Sprite.from(Texture.from('button')));
    button.width = BUTTON_WIDTH;
    button.height = BUTTON_HEIGHT;
    button.x = BUTTON_X;
    button.y = BUTTON_Y;

    const buttonText = new Text({
      text: this.translation.getTranslation('hangar.upgrade'),
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 12,
        fill: 0x000000,
      },
    });
    buttonText.anchor.set(HALF, HALF);
    buttonText.x = (BUTTON_WIDTH * HALF) / button.scale.x;
    buttonText.y = (BUTTON_HEIGHT * HALF) / button.scale.y;
    button.addChild(buttonText);

    button.onPress.connect(() => void this.handleUpgrade(definition.type));
    rowContainer.addChild(button);

    return {
      definition,
      levelText,
      costText,
      button,
    };
  }

  private async handleUpgrade(type: ShipUpgradeType): Promise<void> {
    await this.gameService.handleUpgradePurchase(type);
    this.updateView();
  }

  private updateView(): void {
    for (const [type, row] of this.upgradeRows) {
      const level = this.gameService.shipUpgrades.getLevel(type);
      row.levelText.text = this.translation.getTranslation('hangar.level', {
        level,
        max: row.definition.maxLevel,
      });

      const cost = this.gameService.shipUpgrades.getUpgradeCost(type);

      if (cost === null) {
        row.costText.text = this.translation.getTranslation('hangar.maxLevel');
        row.button.enabled = false;
      } else {
        const hasCoins = this.gameService.coins() >= cost;
        const key = hasCoins ? 'hangar.cost' : 'hangar.costInsufficient';
        row.costText.text = this.translation.getTranslation(key, { cost });
        row.button.enabled = hasCoins;
      }
    }
  }
}
