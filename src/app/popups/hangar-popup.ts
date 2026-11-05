import { ButtonContainer } from '@pixi/ui';
import { Container, Sprite, Text, Texture } from 'pixi.js';
import { PlayerShipClass, PlayerShipDefinition } from '../models/player-ship-class.model';
import { ShipUpgradeBranch, ShipUpgradeDefinition, ShipUpgradeType } from '../models/ship-upgrade.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { BUTTON_SIZE, Popup } from './popup';

const POPUP_HEIGHT = 470;
const HALF = 0.5;
const TREE_TOP = 70;
const BRANCHES = [ShipUpgradeBranch.weapons, ShipUpgradeBranch.armor, ShipUpgradeBranch.tech];
const BRANCH_TITLE_KEYS = {
  [ShipUpgradeBranch.weapons]: 'hangar.branch.weapons',
  [ShipUpgradeBranch.armor]: 'hangar.branch.armor',
  [ShipUpgradeBranch.tech]: 'hangar.branch.tech',
} as const;
const COLUMN_STEP = 82;
const NODE_WIDTH = 74;
const NODE_HEIGHT = 34;
const NODE_ROW_STEP = 44;
const BRANCH_TITLE_GAP = 14;
const NODE_TOP = TREE_TOP + BRANCH_TITLE_GAP;
const NODE_PADDING = 6;
const NODE_LEVEL_Y = 24;
const CONNECTOR_WIDTH = 3;
const NODE_COLOR = 0xe8dcc8;
const NODE_SELECTED_COLOR = 0xffe08a;
const NODE_MAXED_COLOR = 0xb9e4a6;
const LOCKED_ALPHA = 0.4;
const NODE_ALPHA = 0.8;
const DISABLED_BUTTON_ALPHA = 0.5;
const TEXT_COLOR = 0x3c2f1e;
const TREE_ROWS = 3;
const DETAIL_TOP = NODE_TOP + TREE_ROWS * NODE_ROW_STEP;
const DETAIL_LINE_STEP = 14;
const DETAIL_WRAP_WIDTH = 240;
const DETAIL_TITLE_Y = DETAIL_TOP;
const DETAIL_DESCRIPTION_Y = DETAIL_TOP + DETAIL_LINE_STEP;
const DETAIL_STATUS_Y = DETAIL_DESCRIPTION_Y + DETAIL_LINE_STEP;
const DETAIL_BUTTON_Y = DETAIL_STATUS_Y + DETAIL_LINE_STEP + NODE_PADDING;
const NODE_FONT_SIZE = 9;
const NODE_TITLE_Y = 10;
const TEXT_FONT_SIZE = 10;
const DETAIL_TITLE_FONT_SIZE = 12;
const BACK_BUTTON_Y = DETAIL_BUTTON_Y + BUTTON_SIZE.height + NODE_PADDING + NODE_PADDING;

// Ship selection section constants
const SHIP_SECTION_Y = -70;
const SHIP_SECTION_TITLE_Y = SHIP_SECTION_Y;
const SHIP_CARD_WIDTH = 72;
const SHIP_CARD_GAP = 5;
const SHIP_CARDS_TOTAL = 3;
const SHIP_CARDS_TOTAL_WIDTH = SHIP_CARDS_TOTAL * SHIP_CARD_WIDTH + (SHIP_CARDS_TOTAL - 1) * SHIP_CARD_GAP;
const SHIP_CARD_START_X = -(SHIP_CARDS_TOTAL_WIDTH * HALF);
const SHIP_CARD_INNER_HALF = SHIP_CARD_WIDTH * HALF;
const SHIP_CARD_Y_OFFSET = 14;
const SHIP_CARD_Y = SHIP_SECTION_Y + SHIP_CARD_Y_OFFSET;
const SHIP_CARD_HEIGHT = 115;
const SHIP_CARD_PADDING = 4;
const SHIP_CARD_TITLE_Y = 4;
const SHIP_CARD_DESC_Y = 22;
const SHIP_CARD_STATS_Y = 62;
const SHIP_BUTTON_Y = 85;
const SHIP_BUTTON_WIDTH = 66;
const SHIP_BUTTON_HEIGHT = 24;

interface TreeNode {
  definition: ShipUpgradeDefinition;
  background: Sprite;
  levelText: Text;
  container: Container;
}

interface UpgradeDetail {
  title: Text;
  description: Text;
  status: Text;
  button: ButtonContainer;
}

interface ShipCard {
  definition: PlayerShipDefinition;
  button: ButtonContainer;
  buttonText: Text;
}

export class HangarPopup extends Popup {
  private readonly treeNodes = new Map<ShipUpgradeType, TreeNode>();
  private readonly shipCards: ShipCard[] = [];
  private readonly detail: UpgradeDetail;
  private selectedUpgrade: ShipUpgradeType;

  constructor(
    private readonly gameService: GameService,
    private readonly translation: TranslationService,
  ) {
    super(translation.getTranslation('hangar.title'), POPUP_HEIGHT);

    this.createShipSelectionSection();

    this.selectedUpgrade = this.gameService.shipUpgrades.definitions[0].type;
    this.createSkillTree();
    this.detail = this.createDetail();

    const button = this.addButton(
      this.translation.getTranslation('common.back'),
      () => this.gameService.openNavigation(this),
      0,
    );
    button.button.y = BACK_BUTTON_Y;
    this.updateView();
  }

  /** One column per branch; each node sits below the node it requires, joined by a connector. */
  private createSkillTree(): void {
    BRANCHES.forEach((branch, column) => {
      const centerX = (column - 1) * COLUMN_STEP;
      this.addTreeText(this.translation.getTranslation(BRANCH_TITLE_KEYS[branch]), { x: centerX, y: TREE_TOP }, NODE_WIDTH);
      this.gameService.shipUpgrades.definitions
        .filter((definition) => definition.branch === branch)
        .forEach((definition, row) => {
          const y = NODE_TOP + row * NODE_ROW_STEP;
          if (row > 0) {
            const connector = new Sprite(Texture.WHITE);
            connector.tint = TEXT_COLOR;
            connector.width = CONNECTOR_WIDTH;
            connector.height = NODE_ROW_STEP - NODE_HEIGHT;
            connector.x = centerX - CONNECTOR_WIDTH * HALF;
            connector.y = y - connector.height;
            this.addToContent(connector);
          }
          this.treeNodes.set(definition.type, this.createTreeNode(definition, centerX, y));
        });
    });
  }

  private createTreeNode(definition: ShipUpgradeDefinition, centerX: number, y: number): TreeNode {
    const container = new Container();
    container.x = centerX - NODE_WIDTH * HALF;
    container.y = y;

    const background = new Sprite(Texture.WHITE);
    background.width = NODE_WIDTH;
    background.height = NODE_HEIGHT;
    container.addChild(background);

    const title = this.createFittedText(this.translation.getTranslation(definition.titleKey), NODE_FONT_SIZE, NODE_WIDTH - NODE_PADDING);
    title.x = NODE_WIDTH * HALF;
    title.y = NODE_TITLE_Y;
    container.addChild(title);

    const levelText = this.createFittedText('', NODE_FONT_SIZE, NODE_WIDTH - NODE_PADDING);
    levelText.x = NODE_WIDTH * HALF;
    levelText.y = NODE_LEVEL_Y;
    container.addChild(levelText);

    const button = new ButtonContainer(container);
    button.onPress.connect(() => {
      this.selectedUpgrade = definition.type;
      this.updateUpgradeView();
    });
    this.addToContent(button);

    return { definition, background, levelText, container };
  }

  private createDetail(): UpgradeDetail {
    const title = this.addTreeText('', { x: 0, y: DETAIL_TITLE_Y }, DETAIL_WRAP_WIDTH, DETAIL_TITLE_FONT_SIZE);
    const description = this.addTreeText('', { x: 0, y: DETAIL_DESCRIPTION_Y }, DETAIL_WRAP_WIDTH);
    const status = this.addTreeText('', { x: 0, y: DETAIL_STATUS_Y }, DETAIL_WRAP_WIDTH);

    const { button } = this.addButton(
      this.translation.getTranslation('hangar.upgrade'),
      () => void this.handleUpgrade(this.selectedUpgrade),
      0,
    );
    button.y = DETAIL_BUTTON_Y;

    return { title, description, status, button };
  }

  private addTreeText(content: string, position: { x: number; y: number }, maxWidth: number, fontSize = TEXT_FONT_SIZE): Text {
    const text = this.createFittedText(content, fontSize, maxWidth);
    text.position.set(position.x, position.y);
    this.addToContent(text);
    return text;
  }

  /** Centered text that shrinks (never wraps) so long names in any language stay inside their box. */
  private createFittedText(content: string, fontSize: number, maxWidth: number): Text {
    const text = new Text({ text: content, style: { fontFamily: 'DefaultFont', fontSize, fill: TEXT_COLOR } });
    text.anchor.set(HALF, HALF);
    text.onRender = (): void => {
      text.scale.set(1);
      text.scale.set(Math.min(1, maxWidth / Math.max(1, text.width)));
    };
    return text;
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
    this.updateUpgradeView();
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

  private updateUpgradeView(): void {
    const upgrades = this.gameService.shipUpgrades;
    for (const [type, node] of this.treeNodes) {
      const level = upgrades.getLevel(type);
      const maxed = level >= node.definition.maxLevel;
      node.levelText.text = `${level} / ${node.definition.maxLevel}`;
      node.container.alpha = upgrades.isUnlocked(type) || level > 0 ? 1 : LOCKED_ALPHA;
      node.background.alpha = NODE_ALPHA;
      node.background.tint = maxed ? NODE_MAXED_COLOR : NODE_COLOR;
      if (type === this.selectedUpgrade) {
        node.background.tint = NODE_SELECTED_COLOR;
      }
    }

    const definition = upgrades.getDefinition(this.selectedUpgrade);
    const level = upgrades.getLevel(definition.type);
    this.detail.title.text = `${this.translation.getTranslation(definition.titleKey)} – ${this.translation.getTranslation('hangar.level', { level, max: definition.maxLevel })}`;
    this.detail.description.text = this.translation.getTranslation(definition.descriptionKey);

    const cost = upgrades.getUpgradeCost(definition.type);
    if (cost === null) {
      this.detail.status.text = this.translation.getTranslation('hangar.maxLevel');
      this.detail.button.enabled = false;
    } else if (!upgrades.isUnlocked(definition.type) && definition.requires) {
      this.detail.status.text = this.translation.getTranslation('hangar.requires', {
        name: this.translation.getTranslation(upgrades.getDefinition(definition.requires.type).titleKey),
        level: definition.requires.level,
      });
      this.detail.button.enabled = false;
    } else {
      const hasCoins = this.gameService.coins() >= cost;
      this.detail.status.text = this.translation.getTranslation(hasCoins ? 'hangar.cost' : 'hangar.costInsufficient', { cost });
      this.detail.button.enabled = hasCoins;
    }
    this.detail.button.alpha = this.detail.button.enabled ? 1 : DISABLED_BUTTON_ALPHA;
  }
}
