import { Button } from '@pixi/ui';
import gsap from 'gsap';
import { Container, Sprite, Text, Texture } from 'pixi.js';
import { PixiGameService } from '../services/pixi-game.service';

export class NavigationPopup extends Container {
  private readonly background: Sprite;
  private readonly panel: Sprite;
  private readonly title: Text;
  private readonly doneButton: Button;
  private readonly panelBase: Container;

  constructor(gameService: PixiGameService) {
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

    this.title = new Text('Solarstriker', { fontFamily: 'DefaultFont', dropShadowColor: '000000', fontSize: 14 });
    this.title.x = 0;
    this.title.y = -96;
    this.title.anchor.set(0.5, 0.5);
    this.panel.addChild(this.title);

    this.doneButton = new Button(Sprite.from('assets/ui/yellow_button00.png'));
    this.doneButton.view.width = 190;
    this.doneButton.view.height = 49;
    this.doneButton.view.y = -50;
    this.doneButton.view.x = -95;
    const text = new Text('Spiel starten!', { fontFamily: 'DefaultFont', dropShadowColor: '000000', fontSize: 14 });
    text.anchor.set(0.5, 0.5);
    text.x = 100;
    text.y = 20;
    this.doneButton.view.addChild(text);
    this.doneButton.onPress.connect(() => gameService.start(this));
    this.panel.addChild(this.doneButton.view);
  }

  /** Present the popup, animated */
  public async show() {
    gsap.killTweensOf(this.background);
    gsap.killTweensOf(this.panel.pivot);
    this.background.alpha = 0;
    this.panel.pivot.y = -400;
    gsap.to(this.background, { alpha: 0.8, duration: 0.2, ease: 'linear' });
    await gsap.to(this.panel.pivot, { y: 0, duration: 0.3, ease: 'back.out' });
  }

  /** Dismiss the popup, animated */
  public async hide() {
    gsap.killTweensOf(this.background);
    gsap.killTweensOf(this.panel.pivot);
    gsap.to(this.background, { alpha: 0, duration: 0.2, ease: 'linear' });
    await gsap.to(this.panel.pivot, { y: -500, duration: 0.3, ease: 'back.in' });
  }

  public resize(width: number, height: number) {
    this.background.width = width;
    this.background.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }
}
