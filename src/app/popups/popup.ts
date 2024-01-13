import { Button } from '@pixi/ui';
import gsap from 'gsap';
import { Container, Sprite, Text, Texture } from 'pixi.js';

export abstract class Popup extends Container {
  private readonly container: Container;
  private readonly background: Sprite;
  private readonly title: Text;

  protected constructor(title: string, height = 230) {
    super();

    height = Math.max(height, 230);

    this.background = Sprite.from(Texture.EMPTY);
    this.background.tint = 0xffcc55;
    this.background.eventMode = 'none';
    this.addChild(this.background);

    this.container = new Container();
    this.container.width = 265;
    this.container.height = 430;

    this.addChild(this.container);
    const panel = Sprite.from('assets/ui/navigation-popup.png');
    panel.anchor.set(0.5);
    panel.width = 265;
    panel.height = 230;
    this.container.addChild(panel);

    if (height > 230) {
      const bottom = Sprite.from('assets/ui/navigation-popup-bottom.png');
      bottom.anchor.set(0.5, 0.5);
      bottom.width = 265;
      bottom.height = 230;
      bottom.y = Math.max(80, height - 230);
      bottom.x = 0;
      this.container.addChild(bottom);
    }

    this.title = new Text(title, { fontFamily: 'DefaultFont', dropShadowColor: '000000', fontSize: 14 });
    this.title.x = 0;
    this.title.y = -96;
    this.title.anchor.set(0.5, 0.5);
    this.background.addChild(this.title);
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
    this.container.x = width * 0.5;
    this.container.y = height * 0.5;
  }

  protected addText(
    content: string,
    appearance: { size: number, rotated?: boolean },
    position: { y: number; x?: number }): void {
    const text = new Text(content, {
      fontFamily: 'DefaultFont',
      dropShadowColor: '000000',
      fontSize: appearance.size,
    });
    text.x = position.x ?? 0;
    text.y = position.y;
    text.anchor.set(0.5, 0.5);
    text.rotation = appearance.rotated ? -3.14 / 2 : 0;
    this.container.addChild(text);
  }

  protected addButton(textContent: string, callback: () => void, index: number): void {
    const button = new Button(Sprite.from('assets/ui/yellow_button00.png'));
    button.view.width = 190;
    button.view.height = 49;
    button.view.x = -95;
    button.view.y = -65 + index * 60;

    const text = new Text(textContent, { fontFamily: 'DefaultFont', dropShadowColor: '000000', fontSize: 14 });
    text.anchor.set(0.5, 0.5);
    text.x = 100;
    text.y = 20;
    button.view.addChild(text);

    button.onPress.connect(callback);
    this.container.addChild(button.view);
  }
}
