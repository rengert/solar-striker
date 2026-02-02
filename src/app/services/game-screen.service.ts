import { inject, Injectable } from '@angular/core';
import { Container, Graphics, Text } from 'pixi.js';
import { fontAwesomeStyle, icons } from '../style-constants';
import { GameShipService } from './game-ship.service';
import { UpdatableService } from './updatable.service';

const HEADER_TOP_PADDING = 20;
const HEADER_LINE_SPACING = 22;
const HEADER_SIDE_PADDING = 8;
const DOUBLE = 2;
const TRIPPLE = 3;

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
    this.points!.x = this.application.screen.width - this.points!.width - HEADER_SIDE_PADDING;
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
    this.points.x = this.application.screen.width - this.points.width - HEADER_SIDE_PADDING;
    this.points.y = HEADER_TOP_PADDING + HEADER_LINE_SPACING * DOUBLE;
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

    this.lifesLabel.x = HEADER_SIDE_PADDING;
    this.lifesLabel.y = HEADER_TOP_PADDING + HEADER_LINE_SPACING * TRIPPLE;
    this.addToStage(this.lifesLabel);

    this.levelLabel.x = this.application.screen.width - this.levelLabel.width - HEADER_SIDE_PADDING;
    this.levelLabel.y = HEADER_TOP_PADDING + HEADER_LINE_SPACING;
    this.addToStage(this.levelLabel);

    this.coinLabel.x = this.application.screen.width - this.coinLabel.width - HEADER_SIDE_PADDING;
    this.coinLabel.y = HEADER_TOP_PADDING;
    this.addToStage(this.coinLabel);
  }

  update(): void {
    this.lifes = this.#ship.instance.energy;
  }
}
