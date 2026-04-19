import { ButtonContainer, ScrollBox } from '@pixi/ui';
import { Container, Sprite, Text, Texture } from 'pixi.js';
import { PlayerShipClass, PlayerShipDefinition } from '../models/player-ship-class.model';
import { ShipUpgradeDefinition, ShipUpgradeType } from '../models/ship-upgrade.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 500;
const HALF = 0.5;
const SCROLL_BOX_WIDTH = 240;
const SCROLL_BOX_HEIGHT = 240;
const SCROLL_BOX_X = -(SCROLL_BOX_WIDTH * HALF);
const SCROLL_BOX_Y = 20;

// Ship selection section constants
const SHIP_SECTION_Y = -195;
const SHIP_SECTION_TITLE_Y = SHIP_SECTION_Y;
const SHIP_CARD_WIDTH = 72;
const SHIP_CARD_GAP = 5;
const SHIP_CARDS_TOTAL = 3;
const SHIP_CARDS_TOTAL_WIDTH = SHIP_CARDS_TOTAL * SHIP_CARD_WIDTH + (SHIP_CARDS_TOTAL - 1) * SHIP_CARD_GAP;
const SHIP_CARD_START_X = -(SHIP_CARDS_TOTAL_WIDTH * HALF);
const SHIP_CARD_INNER_HALF = SHIP_CARD_WIDTH * HALF;
const SHIP_CARD_Y_OFFSET = 18;
const SHIP_CARD_Y = SHIP_SECTION_Y + SHIP_CARD_Y_OFFSET;
const SHIP_CARD_HEIGHT = 115;
const SHIP_CARD_PADDING = 4;
const SHIP_CARD_TITLE_Y = 4;
const SHIP_CARD_DESC_Y = 22;
const SHIP_CARD_STATS_Y = 62;
const SHIP_BUTTON_Y = 85;
const SHIP_BUTTON_WIDTH = 66;
const SHIP_BUTTON_HEIGHT = 24;
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

interface ShipCard {
  definition: PlayerShipDefinition;
  button: ButtonContainer;
  buttonText: Text;
}

export class HangarPopup extends Popup {
  private readonly upgradeRows = new Map<ShipUpgradeType, UpgradeRow>();
  private readonly shipCards: ShipCard[] = [];

  constructor(
    private readonly gameService: GameService,
    private readonly translation: TranslationService,
  ) {
    super(translation.getTranslation('hangar.title'), POPUP_HEIGHT);

    this.y = -150;

    this.createShipSelectionSection();

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

  private createShipSelectionSection(): void {
    const sectionTitle = new Text({
      text: this.translation.getTranslation('hangar.shipSelection'),
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 11,
        fill: 0x3c2f1e,
      },
    });
    sectionTitle.anchor.set(HALF, HALF);
    sectionTitle.x = 0;
    sectionTitle.y = SHIP_SECTION_TITLE_Y;
    this.addToContent(sectionTitle);

    this.gameService.playerShipService.definitions.forEach((definition, index) => {
      const cardX = SHIP_CARD_START_X + index * (SHIP_CARD_WIDTH + SHIP_CARD_GAP);
      const card = this.createShipCard(definition, cardX);
      this.shipCards.push(card);
    });
  }

  // eslint-disable-next-line max-lines-per-function
  private createShipCard(definition: PlayerShipDefinition, cardX: number): ShipCard {
    const cardContainer = new Container();
    cardContainer.x = cardX;
    cardContainer.y = SHIP_CARD_Y;
    this.addToContent(cardContainer);

    const bg = new Sprite(Texture.WHITE);
    bg.width = SHIP_CARD_WIDTH;
    bg.height = SHIP_CARD_HEIGHT;
    // eslint-disable-next-line no-magic-numbers
    bg.tint = 0xe8dcc8;
    bg.alpha = 0.6;
    cardContainer.addChild(bg);

    const title = new Text({
      text: this.translation.getTranslation(definition.titleKey),
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 9,
        fill: 0x3c2f1e,
        fontWeight: 'bold',
        wordWrap: true,
        wordWrapWidth: SHIP_CARD_WIDTH - SHIP_CARD_PADDING,
        align: 'center',
      },
    });
    title.anchor.set(HALF, 0);
    title.x = SHIP_CARD_INNER_HALF;
    title.y = SHIP_CARD_TITLE_Y;
    cardContainer.addChild(title);

    const desc = new Text({
      text: this.translation.getTranslation(definition.descriptionKey),
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 8,
        fill: 0x3c2f1e,
        wordWrap: true,
        wordWrapWidth: SHIP_CARD_WIDTH - SHIP_CARD_PADDING,
        align: 'center',
      },
    });
    desc.anchor.set(HALF, 0);
    desc.x = SHIP_CARD_INNER_HALF;
    desc.y = SHIP_CARD_DESC_Y;
    cardContainer.addChild(desc);

    const stats = new Text({
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      text: `⚡${definition.energy}  💥${definition.shotPower}`,
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 8,
        fill: 0x3c2f1e,
        align: 'center',
      },
    });
    stats.anchor.set(HALF, HALF);
    stats.x = SHIP_CARD_INNER_HALF;
    stats.y = SHIP_CARD_STATS_Y;
    cardContainer.addChild(stats);

    const button = new ButtonContainer(Sprite.from(Texture.from('button')));
    button.width = SHIP_BUTTON_WIDTH;
    button.height = SHIP_BUTTON_HEIGHT;
    button.x = (SHIP_CARD_WIDTH - SHIP_BUTTON_WIDTH) * HALF;
    button.y = SHIP_BUTTON_Y;

    const buttonText = new Text({
      text: '',
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 8,
        fill: 0x000000,
      },
    });
    buttonText.anchor.set(HALF, HALF);
    buttonText.x = (SHIP_BUTTON_WIDTH * HALF) / button.scale.x;
    buttonText.y = (SHIP_BUTTON_HEIGHT * HALF) / button.scale.y;
    button.addChild(buttonText);

    button.onPress.connect(() => void this.handleShipClassAction(definition.type));
    cardContainer.addChild(button);

    return { definition, button, buttonText };
  }

  private async handleShipClassAction(cls: PlayerShipClass): Promise<void> {
    await this.gameService.handleShipClassPurchase(cls);
    this.updateView();
  }

  private async handleUpgrade(type: ShipUpgradeType): Promise<void> {
    await this.gameService.handleUpgradePurchase(type);
    this.updateView();
  }

  private updateView(): void {
    this.updateShipCards();
    this.updateUpgradeRows();
  }

  private updateShipCards(): void {
    const selectedClass = this.gameService.playerShipService.getSelectedClass();

    for (const card of this.shipCards) {
      const isSelected = card.definition.type === selectedClass;
      const isUnlocked = this.gameService.playerShipService.isUnlocked(card.definition.type);

      if (isSelected) {
        card.buttonText.text = this.translation.getTranslation('hangar.selected');
        card.button.enabled = false;
      } else if (isUnlocked) {
        card.buttonText.text = this.translation.getTranslation('hangar.select');
        card.button.enabled = true;
      } else {
        const canAfford = this.gameService.coins() >= card.definition.cost;
        card.buttonText.text = this.translation.getTranslation('hangar.buy', {
          cost: card.definition.cost,
        });
        card.button.enabled = canAfford;
      }
    }
  }

  private updateUpgradeRows(): void {
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
