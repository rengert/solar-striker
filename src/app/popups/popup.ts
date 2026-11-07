import { ButtonContainer } from '@pixi/ui';
import gsap from 'gsap';
import { Container, NineSliceSprite, Sprite, Text, Texture } from 'pixi.js';
import { LabeledButton } from '../models/pixijs/labeled-button.model';

const PANEL_WIDTH = 265;
const PANEL_TOP = -115;
const PANEL_SLICE = { leftWidth: 12, rightWidth: 12, topHeight: 50, bottomHeight: 12 };
// same panel scale as the main menu, so buttons and text match on every screen
const SCREEN_FILL = 0.8;
const MAX_SCALE = 1.5;
// native size of the button texture; index slots below are spaced for it
const BUTTON_TEXTURE = { width: 190, height: 49 };
const BUTTON_SLOT_STEP = 52;
/** Shared button size for every screen, matching the main menu. */
export const BUTTON_SIZE = { width: 160, height: 36, fontSize: 12 };
const BUTTON_LABEL_PADDING = 16;

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
    const scale = Math.min(
      MAX_SCALE,
      (width * SCREEN_FILL) / PANEL_WIDTH,
      (height * SCREEN_FILL) / this.panelHeight,
    );
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
    const size = BUTTON_SIZE;
    const button = new ButtonContainer(Sprite.from(Texture.from('button')));
    button.width = size.width;
    button.height = size.height;
    // eslint-disable-next-line no-magic-numbers
    button.x = -size.width / 2;
    // centre the button in its slot so layouts built on the texture height keep their spacing
    // eslint-disable-next-line no-magic-numbers
    button.y = -70 + index * BUTTON_SLOT_STEP + (BUTTON_TEXTURE.height - size.height) / 2;

    const label = new Text({
      text: textContent,
      style: {
        fontFamily: 'DefaultFont',
        fontSize: size.fontSize,
      },
    });
    // eslint-disable-next-line no-magic-numbers
    label.anchor.set(0.5, 0.5);
    label.x = 100;
    label.y = 22;
    button.addChild(label);
    Popup.fitLabel({ button, label });
    button.onPress.connect(callback);
    this.container.addChild(button);
    return { button, label };
  }

  /** Undo the button's stretch on its label and shrink the text until it fits inside the button. */
  protected static fitLabel({ button, label }: LabeledButton): void {
    // the button texture is BUTTON_TEXTURE.width wide, so its on-screen width follows from the scale
    const buttonWidth = BUTTON_TEXTURE.width * button.scale.x;
    label.scale.set(1);
    const fit = label.width > 0 ? Math.min(1, (buttonWidth - BUTTON_LABEL_PADDING) / label.width) : 1;
    label.scale.set(fit / button.scale.x, fit / button.scale.y);
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
