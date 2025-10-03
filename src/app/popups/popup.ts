import { ButtonContainer } from '@pixi/ui';
import gsap from 'gsap';
import { Container, Sprite, Text, Texture } from 'pixi.js';

export abstract class Popup extends Container {
  private readonly container: Container;
  private readonly background: Sprite;

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
    this.container.width = 265;
    this.container.height = 430;

    this.addChild(this.container);
    const panel = new Sprite(Texture.from('popup'));
    // eslint-disable-next-line no-magic-numbers
    panel.anchor.set(0.5);
    panel.width = 265;
    panel.height = 230;
    this.container.addChild(panel);

    // eslint-disable-next-line no-magic-numbers
    if (height > 230) {
      this.setLongPopup(height);
    }
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
    // eslint-disable-next-line no-magic-numbers
    this.container.x = width * 0.5;
    // eslint-disable-next-line no-magic-numbers
    this.container.y = height * 0.5;
  }

  protected addText(
    content: string,
    appearance: { size: number; rotated?: boolean },
    position: { y: number; x?: number },
  ): void {
    const text = new Text({
      text: content,
      style: {
        fontFamily: 'DefaultFont',
        fontSize: appearance.size,
      },
    });
    text.x = position.x ?? 0;
    text.y = position.y;
    // eslint-disable-next-line no-magic-numbers
    text.anchor.set(0.5, 0.5);
    // eslint-disable-next-line no-magic-numbers
    text.rotation = appearance.rotated ? -3.14 / 2 : 0;
    this.container.addChild(text);
  }

  protected addButton(textContent: string, callback: () => void, index: number): void {
    const button = new ButtonContainer(Sprite.from(Texture.from('button')));
    button.width = 190;
    button.height = 49;
    button.x = -95;
    // eslint-disable-next-line no-magic-numbers
    button.y = -65 + index * 60;

    const text = new Text({
      text: textContent,
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 14,
      },
    });
    // eslint-disable-next-line no-magic-numbers
    text.anchor.set(0.5, 0.5);
    text.x = 100;
    text.y = 22;
    button.addChild(text);

    button.onPress.connect(callback);
    this.container.addChild(button);
  }

  protected addToContent(displayObject: Container): void {
    this.container.addChild(displayObject);
  }

  private addTitle(text: string): void {
    const title = new Text({
      text,
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 14,
        fill: 0xffffff,
      },
    });
    title.x = 0;
    title.y = -96;
    // eslint-disable-next-line no-magic-numbers
    title.anchor.set(0.5, 0.5);
    this.container.addChild(title);
  }

  private setLongPopup(height: number): void {
    const bottom = new Sprite(Texture.from('popup-bottom'));
    // eslint-disable-next-line no-magic-numbers
    bottom.anchor.set(0.5, 0.5);
    bottom.width = 265;
    bottom.height = 230;
    // eslint-disable-next-line no-magic-numbers
    bottom.y = Math.max(80, height - 230);
    bottom.x = 0;
    this.container.addChild(bottom);
  }
}
