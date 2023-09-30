import { Button } from '@pixi/ui';
import gsap from 'gsap';
import { Container, Sprite, Text, Texture } from 'pixi.js';

export abstract class Popup extends Container {
  protected readonly panel: Sprite;

  private readonly background: Sprite;
  private readonly title: Text;
  private readonly panelBase: Container;

  protected constructor(title: string) {
    super();

    this.background = Sprite.from(Texture.WHITE);
    this.background.tint = 0xffcc55;
    this.background.eventMode = 'none';
    this.addChild(this.background);

    this.panel = Sprite.from('assets/ui/navigation-popup.png');
    this.panel.anchor.set(0.5);
    this.panel.width = 265;
    this.panel.height = 230;
    this.addChild(this.panel);

    this.panelBase = new Container();
    this.panelBase.height = 400;
    this.panelBase.width = 400;
    this.panel.addChild(this.panelBase);

    this.title = new Text(title, { fontFamily: 'DefaultFont', dropShadowColor: '000000', fontSize: 14 });
    this.title.x = 0;
    this.title.y = -96;
    this.title.anchor.set(0.5, 0.5);
    this.panel.addChild(this.title);
  }

  async show(): Promise<void> {
    gsap.killTweensOf(this.background);
    gsap.killTweensOf(this.panel.pivot);
    this.background.alpha = 0;
    this.panel.pivot.y = -400;
    gsap.to(this.background, { alpha: 0.8, duration: 0.2, ease: 'linear' });
    await gsap.to(this.panel.pivot, { y: 0, duration: 0.3, ease: 'back.out' });
  }

  async hide(): Promise<void> {
    gsap.killTweensOf(this.background);
    gsap.killTweensOf(this.panel.pivot);
    gsap.to(this.background, { alpha: 0, duration: 0.2, ease: 'linear' });
    await gsap.to(this.panel.pivot, { y: -500, duration: 0.3, ease: 'back.in' });
  }

  resize(width: number, height: number): void {
    this.background.width = width;
    this.background.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  protected addText(
    panel: Sprite,
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
    panel.addChild(text);
  }

  protected addButton(textContent: string, callback: () => void, index: number, panel: Sprite): void {
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
    panel.addChild(button.view);
  }
}
