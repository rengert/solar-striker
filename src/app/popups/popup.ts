import { ButtonContainer } from '@pixi/ui';
import gsap from 'gsap';
import { Container, NineSliceSprite, Sprite, Text, Texture } from 'pixi.js';
import { LabeledButton } from '../models/pixijs/labeled-button.model';

const PANEL_WIDTH = 265;
const PANEL_TOP = -115;
const PANEL_SLICE = { leftWidth: 12, rightWidth: 12, topHeight: 50, bottomHeight: 12 };
const SCREEN_FILL = 0.92;
const MAX_SCALE = 2;

export abstract class Popup extends Container {
  private readonly container: Container;
  private readonly panelHeight: number;
  private readonly background: Sprite;
  private titleLabel!: Text;

  // eslint-disable-next-line no-magic-numbers
  protected constructor(title: string, height = 230) {
    super();

    // eslint-disable-next-line no-magic-numbers
    height = Math.max(height, 230);

    this.background = Sprite.from(Texture.EMPTY);
    this.background.tint = 0xffcc55;
    this.background.eventMode = 'none';
    this.addChild(this.background);

    this.container = new Container();
    this.addChild(this.container);
    this.panelHeight = height;
    // nine-slice keeps header and rounded corners intact at any height
    const panel = new NineSliceSprite({ texture: Texture.from('popup'), ...PANEL_SLICE });
    panel.width = PANEL_WIDTH;
    panel.height = height;
    // eslint-disable-next-line no-magic-numbers
    panel.x = -PANEL_WIDTH / 2;
    panel.y = PANEL_TOP;
    this.container.addChild(panel);

    this.addTitle(title);
  }

  async show(): Promise<void> {
    gsap.killTweensOf(this.background);
    gsap.killTweensOf(this.container.pivot);
    this.background.alpha = 0;
    this.container.pivot.y = -400;
    gsap.to(this.background, { alpha: 0.8, duration: 0.2, ease: 'linear' });
    await gsap.to(this.container.pivot, { y: 0, duration: 0.3, ease: 'back.out' });
  }

  async hide(): Promise<void> {
    gsap.killTweensOf(this.background);
    gsap.killTweensOf(this.container.pivot);
    gsap.to(this.background, { alpha: 0, duration: 0.2, ease: 'linear' });
    await gsap.to(this.container.pivot, { y: -500, duration: 0.3, ease: 'back.in' });
  }

  resize(width: number, height: number): void {
    this.background.width = width;
    this.background.height = height;
    // fit the whole panel on screen (phones shrink it, large screens enlarge it)
    const scale = Math.min(MAX_SCALE, (width * SCREEN_FILL) / PANEL_WIDTH, (height * SCREEN_FILL) / this.panelHeight);
    this.container.scale.set(scale);
    // eslint-disable-next-line no-magic-numbers
    this.container.x = width * 0.5;
    // eslint-disable-next-line no-magic-numbers
    this.container.y = height * 0.5 - (PANEL_TOP + this.panelHeight / 2) * scale;
  }

  protected addText(
    content: string,
    appearance: { size: number; rotated?: boolean; anchorX?: number; fill?: number },
    position: { y: number; x?: number },
  ): Text {
    const text = new Text({
      text: content,
      style: {
        fontFamily: 'DefaultFont',
        fontSize: appearance.size,
        ...(appearance.fill === undefined ? {} : { fill: appearance.fill }),
      },
    });
    text.x = position.x ?? 0;
    text.y = position.y;
    // eslint-disable-next-line no-magic-numbers
    text.anchor.set(appearance.anchorX ?? 0.5, 0.5);
    // eslint-disable-next-line no-magic-numbers
    text.rotation = appearance.rotated ? -3.14 / 2 : 0;
    this.container.addChild(text);
    return text;
  }

  protected addButton(textContent: string, callback: () => void, index: number): LabeledButton {
    const button = new ButtonContainer(Sprite.from(Texture.from('button')));
    button.width = 190;
    button.height = 49;
    button.x = -95;
    // eslint-disable-next-line no-magic-numbers
    button.y = -70 + index * 52;

    const label = new Text({
      text: textContent,
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 14,
      },
    });
    // eslint-disable-next-line no-magic-numbers
    label.anchor.set(0.5, 0.5);
    label.x = 100;
    label.y = 22;
    button.addChild(label);

    button.onPress.connect(callback);
    this.container.addChild(button);
    return { button, label };
  }

  protected addToContent(displayObject: Container): void {
    this.container.addChild(displayObject);
  }

  protected updateTitle(text: string): void {
    this.titleLabel.text = text;
  }

  private addTitle(text: string): void {
    this.titleLabel = new Text({
      text,
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 14,
        fill: 0xffffff,
      },
    });
    this.titleLabel.x = 0;
    this.titleLabel.y = -96;
    // eslint-disable-next-line no-magic-numbers
    this.titleLabel.anchor.set(0.5, 0.5);
    this.container.addChild(this.titleLabel);
  }
}
