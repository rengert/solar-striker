import { Injectable } from '@angular/core';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { ApplicationService } from './application.service';

@Injectable()
export class GameScreenService {
  private readonly style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 3,
    align: 'right',
  });
  private points: Text | undefined;
  private lifesLabel: Graphics | undefined;
  private levelLabel: Text | undefined;

  constructor(private readonly application: ApplicationService) {
  }

  init(): void {
    this.points = new Text('0000000', this.style);
    this.points.x = 5;
    this.points.y = 65;
    this.application.stage.addChild(this.points);

    const energyBarContainer = new Container();
    this.lifesLabel = new Graphics();
    this.lifesLabel.beginFill(0xff0000);
    this.lifesLabel.drawRect(0, 0, 250, 10);
    this.lifesLabel.endFill();
    energyBarContainer.addChild(this.lifesLabel);
    this.application.stage.addChild(energyBarContainer);

    this.lifesLabel.x = 5;
    this.lifesLabel.y = 55;
    this.application.stage.addChild(this.lifesLabel);

    this.levelLabel = new Text('Level: 1', this.style);
    this.levelLabel.x = this.application.screen.width - this.levelLabel.width;
    this.levelLabel.y = 45;
    this.application.stage.addChild(this.levelLabel);
  }

  set kills(value: number) {
    this.points !.text = value.toString().padStart(7, '0');
  }

  set lifes(value: number) {
    this.lifesLabel !.width = value * 25;
  }

  set level(value: number) {
    this.levelLabel !.text = 'Level: ' + value.toString();
    this.levelLabel !.updateText(true);
    this.levelLabel !.x = this.application.screen.width - this.levelLabel !.width;
  }
}
