import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

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
  private readonly points!: Text;
  private readonly lifesLabel!: Graphics;
  private readonly levelLabel!: Text;

  constructor(private readonly app: Application) {
    this.points = new Text('0000000', this.style);
    this.points.x = 5;
    this.points.y = 65;
    this.app.stage.addChild(this.points);

    const energyBarContainer = new Container();
    this.lifesLabel = new Graphics();
    this.lifesLabel.beginFill(0xff0000);
    this.lifesLabel.drawRect(0, 0, 150, 10);
    this.lifesLabel.endFill();
    energyBarContainer.addChild(this.lifesLabel);
    this.app.stage.addChild(energyBarContainer);

    this.lifesLabel.x = 5;
    this.lifesLabel.y = 35;
    this.app.stage.addChild(this.lifesLabel);

    this.levelLabel = new Text('Level: 1', this.style);
    this.levelLabel.x = this.app.screen.width - this.levelLabel.width;
    this.levelLabel.y = 35;
    this.app.stage.addChild(this.levelLabel);
  }

  set kills(value: number) {
    this.points.text = value.toString().padStart(7, '0');
  }

  set lifes(value: number) {
    this.lifesLabel.width = value * 50;
  }

  set level(value: number) {
    this.levelLabel.text = 'Level: ' + value.toString();
    this.levelLabel.updateText(true);
    this.levelLabel.x = this.app.screen.width - this.levelLabel.width;
  }
}
