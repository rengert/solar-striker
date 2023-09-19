import { Button } from '@pixi/ui';
import { Sprite, Text } from 'pixi.js';
import { PixiGameService } from '../services/pixi-game.service';
import { Popup } from './popup';

export class NavigationPopup extends Popup {

  constructor(private readonly gameService: PixiGameService) {
    super('Solarstriker');

    this.addStartButton(this.panel);
    this.addCreditsButton(this.panel);
  }

  private addStartButton(panel: Sprite): void {
    const startButton = new Button(Sprite.from('assets/ui/yellow_button00.png'));
    startButton.view.width = 190;
    startButton.view.height = 49;
    startButton.view.y = -50;
    startButton.view.x = -95;
    const text = new Text('Spiel starten!', { fontFamily: 'DefaultFont', dropShadowColor: '000000', fontSize: 14 });
    text.anchor.set(0.5, 0.5);
    text.x = 100;
    text.y = 20;
    startButton.view.addChild(text);
    startButton.onPress.connect(() => this.gameService.start(this));
    panel.addChild(startButton.view);
  }

  private addCreditsButton(panel: Sprite) {
    const creditButton = new Button(Sprite.from('assets/ui/yellow_button00.png'));
    creditButton.view.width = 190;
    creditButton.view.height = 49;
    creditButton.view.y = 10;
    creditButton.view.x = -95;
    const text = new Text('Credits', { fontFamily: 'DefaultFont', dropShadowColor: '000000', fontSize: 14 });
    text.anchor.set(0.5, 0.5);
    text.x = 100;
    text.y = 20;
    creditButton.view.addChild(text);
    creditButton.onPress.connect(() => this.gameService.credits(this));
    panel.addChild(creditButton.view);
  }
}
