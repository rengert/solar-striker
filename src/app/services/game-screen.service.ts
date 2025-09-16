import { inject, Injectable } from '@angular/core';
import { Container, Graphics, Text } from 'pixi.js';
import { fontAwesomeStyle, textStyle } from '../style-constants';
import { GameShipService } from './game-ship.service';
import { UpdatableService } from './updatable.service';

@Injectable()
export class GameScreenService extends UpdatableService {
  readonly #ship = inject(GameShipService);

  private readonly points = new Text({ text: '0000000', style: textStyle });
  private readonly coins = new Text({ text: '0 \uf51e  ', style: fontAwesomeStyle });

  private lifesLabel: Graphics | undefined;
  private levelLabel: Text | undefined;

  set kills(value: number) {
    // eslint-disable-next-line no-magic-numbers
    this.points!.text = value.toString().padStart(7, '0');
  }

  set level(value: number) {
    this.levelLabel!.text = `Level: ${value.toString()}`;
    this.levelLabel!.x = this.application.screen.width - this.levelLabel!.width;
  }

  private set lifes(value: number) {
    // eslint-disable-next-line no-magic-numbers
    this.lifesLabel!.width = value * 10;
  }

  init(): void {
    this.points.x = 5;
    this.points.y = 65;
    this.addToStage(this.points);

    const energyBarContainer = new Container();
    this.lifesLabel = new Graphics();
    // eslint-disable-next-line no-magic-numbers
    this.lifesLabel.fill(0xff0000);
    // eslint-disable-next-line no-magic-numbers
    this.lifesLabel.rect(0, 0, 100, 5);
    this.lifesLabel.fill();
    energyBarContainer.addChild(this.lifesLabel);

    this.addToStage(energyBarContainer);

    this.lifesLabel.x = 5;
    this.lifesLabel.y = 55;
    this.addToStage(this.lifesLabel);

    this.levelLabel = new Text({
      text: '32 \uf007  ',
      style: fontAwesomeStyle,
    });
    this.levelLabel.x = this.application.screen.width - this.levelLabel.width;
    this.levelLabel.y = 45;

    this.addToStage(this.levelLabel);

    this.coins.x = this.application.screen.width - this.coins.width;
    this.coins.y = 30;
    this.addToStage(this.coins);
  }

  update(): void {
    this.lifes = this.#ship.instance.energy;
  }
}
