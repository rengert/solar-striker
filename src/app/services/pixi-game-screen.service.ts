import { Application, Text, TextStyle } from 'pixi.js';

export class PixiGameScreenService {
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
  private readonly lifesLabel!: Text;
  private readonly levelLabel!: Text;

  constructor(private readonly app: Application) {
    this.points = new Text('0000000', this.style);
    this.points.x = 5;
    this.points.y = 35;
    this.app.stage.addChild(this.points);

    this.lifesLabel = new Text('Leben: 3', this.style);
    this.lifesLabel.x = 5;
    this.lifesLabel.y = 5;
    this.app.stage.addChild(this.lifesLabel);

    this.levelLabel = new Text('Level: 1', this.style);
    this.levelLabel.x = this.app.screen.width - this.levelLabel.width;
    this.levelLabel.y = 5;
    this.app.stage.addChild(this.levelLabel);
  }

  set kills(value: number) {
    this.points.text = value.toString().padStart(7, '0');
  }

  set lifes(value: number) {
    this.lifesLabel.text = 'Leben: ' + value.toString();
  }

  set level(value: number) {
    this.levelLabel.text = 'Level: ' + value.toString();
    this.levelLabel.updateText(true);
    this.levelLabel.x = this.app.screen.width - this.levelLabel.width;
  }
}
