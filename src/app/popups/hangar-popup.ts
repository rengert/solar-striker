import { ButtonContainer, ScrollBox } from '@pixi/ui';
import { Container, Sprite, Text, Texture } from 'pixi.js';
import { ShipUpgradeDefinition, ShipUpgradeType } from '../models/ship-upgrade.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 430;
const HALF = 0.5;
const SCROLL_BOX_WIDTH = 240;
const SCROLL_BOX_HEIGHT = 290;
const SCROLL_BOX_X = -(SCROLL_BOX_WIDTH * HALF);
const SCROLL_BOX_Y = -65;
const ROW_CENTER_X = SCROLL_BOX_WIDTH * HALF;
const ROW_TITLE_X = -110;
const ROW_TITLE_Y = 10;
const DESCRIPTION_Y = 22;
const LEVEL_LABEL_Y = 42;
const COST_LABEL_Y = 60;
const DESCRIPTION_WORD_WRAP_WIDTH = 110;
const BUTTON_X = 0;
const BUTTON_Y = 70;
const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 30;
const BACK_BUTTON_PADDING = 20;
const BACK_BUTTON_Y = SCROLL_BOX_Y + SCROLL_BOX_HEIGHT + BACK_BUTTON_PADDING;

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

    this.y = -150;

    const scrollBox = new ScrollBox({
      width: SCROLL_BOX_WIDTH,
      height: SCROLL_BOX_HEIGHT,
      disableDynamicRendering: true,
      globalScroll: false,
      vertPadding: 5,
    });
    scrollBox.x = SCROLL_BOX_X;
    scrollBox.y = SCROLL_BOX_Y;
    this.addToContent(scrollBox);

    this.gameService.shipUpgrades.definitions.forEach((definition) => {
      const row = this.createUpgradeRow(definition, scrollBox);
      this.upgradeRows.set(definition.type, row);
    });

    const button = this.addButton(
      this.translation.getTranslation('common.back'),
      () => this.gameService.openNavigation(this),
      0,
    );
    button.button.y = BACK_BUTTON_Y;
    this.updateView();
  }

  private createUpgradeRow(definition: ShipUpgradeDefinition, scrollBox: ScrollBox): UpgradeRow {
    const itemWrapper = new Container();
    const rowContainer = new Container();
    rowContainer.x = ROW_CENTER_X;
    itemWrapper.addChild(rowContainer);

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
    title.y = ROW_TITLE_Y;
    rowContainer.addChild(title);

    const description = new Text({
      text: this.translation.getTranslation(definition.descriptionKey),
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 10,
        fill: 0x3c2f1e,
        wordWrap: true,
        wordWrapWidth: DESCRIPTION_WORD_WRAP_WIDTH,
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

    scrollBox.addItem(itemWrapper);

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
