import { Button } from '@pixi/ui';
import { Sprite, Text } from 'pixi.js';
import { PixiGameService } from '../services/pixi-game.service';
import { Popup } from './popup';

export class CreditsPopup extends Popup {
  constructor(private readonly gameService: PixiGameService) {
    super('Credits');

    this.addText(this.panel, 'Idee & Programmierung', 14, -60);
    this.addText(this.panel, 'Thomas Renger', 12, -40);
    this.addText(this.panel, 'Grafiken', 14, -10);
    this.addText(this.panel, 'Kenney (www.kenney.nl)', 12, 10);

    this.addCloseButton(this.panel);
  }

  private addCloseButton(panel: Sprite): void {
    const creditButton = new Button(Sprite.from('assets/ui/yellow_button00.png'));
    creditButton.view.width = 190;
    creditButton.view.height = 49;
    creditButton.view.y = 55;
    creditButton.view.x = -95;
    const text = new Text('Schließen', { fontFamily: 'DefaultFont', dropShadowColor: '000000', fontSize: 14 });
    text.anchor.set(0.5, 0.5);
    text.x = 100;
    text.y = 20;
    creditButton.view.addChild(text);
    creditButton.onPress.connect(() => this.gameService.openNavigation(this));
    panel.addChild(creditButton.view);
  }
}
