import { Injectable } from '@angular/core';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { ApplicationService } from './application.service';
import { GameShipService } from './game-ship.service';
import { UpdatableService } from './updatable.service';

@Injectable()
export class GameScreenService extends UpdatableService {
  private readonly style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: 'bold',
    fill: '#ffffff',
    stroke: {
      color: '#4a1850',
      width: 5,
    },
    dropShadow: {
      color: '#000000',
      blur: 2,
      // eslint-disable-next-line no-magic-numbers
      angle: Math.PI / 6,
      distance: 3,
    },
    align: 'right',
  });
  private points: Text | undefined;
  private lifesLabel: Graphics | undefined;
  private levelLabel: Text | undefined;

  constructor(
    private readonly application: ApplicationService,
    private readonly ship: GameShipService,
  ) {
    super();
  }

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
    this.lifesLabel!.width = value * 25;
  }

  init(): void {
    this.points = new Text({ text: '0000000', style: this.style });
    this.points.x = 5;
    this.points.y = 65;
    this.application.stage.addChild(this.points);

    const energyBarContainer = new Container();
    this.lifesLabel = new Graphics();
    // eslint-disable-next-line no-magic-numbers
    this.lifesLabel.fill(0xff0000);
    // eslint-disable-next-line no-magic-numbers
    this.lifesLabel.rect(0, 0, 250, 10);
    this.lifesLabel.fill();
    energyBarContainer.addChild(this.lifesLabel);
    this.application.stage.addChild(energyBarContainer);

    this.lifesLabel.x = 5;
    this.lifesLabel.y = 55;
    this.application.stage.addChild(this.lifesLabel);

    this.levelLabel = new Text({ text: 'Level: 1', style: this.style });
    this.levelLabel.x = this.application.screen.width - this.levelLabel.width;
    this.levelLabel.y = 45;
    this.application.stage.addChild(this.levelLabel);
  }

  update(): void {
    this.lifes = this.ship.instance.energy;
  }
}
