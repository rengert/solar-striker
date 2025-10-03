import { inject, Injectable } from '@angular/core';
import { Container, Graphics, Text } from 'pixi.js';
import { fontAwesomeStyle, icons } from '../style-constants';
import { GameShipService } from './game-ship.service';
import { UpdatableService } from './updatable.service';

@Injectable()
export class GameScreenService extends UpdatableService {
  readonly #ship = inject(GameShipService);

  private readonly points = new Text({ text: `0 ${icons.points}  `, style: fontAwesomeStyle });
  private readonly coinLabel = new Text({ text: `0 ${icons.coin}  `, style: fontAwesomeStyle });
  private readonly levelLabel = new Text({ text: `1 ${icons.level}  `, style: fontAwesomeStyle });

  private lifesLabel: Graphics | undefined;

  set kills(value: number) {
    // eslint-disable-next-line no-magic-numbers
    this.points!.text = value.toString().padStart(7, '0');
  }

  set level(value: number) {
    this.levelLabel!.text = `${value} ${icons.level}  `;
    this.levelLabel!.x = this.application.screen.width - this.levelLabel!.width;
  }

  set coins(value: number) {
    this.coinLabel!.text = `${value} ${icons.coin}  `;
    this.coinLabel!.x = this.application.screen.width - this.coinLabel!.width;
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

    this.levelLabel.x = this.application.screen.width - this.levelLabel.width;
    this.levelLabel.y = 45;
    this.addToStage(this.levelLabel);

    this.coinLabel.x = this.application.screen.width - this.coinLabel.width;
    this.coinLabel.y = 30;
    this.addToStage(this.coinLabel);
  }

  update(): void {
    this.lifes = this.#ship.instance.energy;
  }
}
