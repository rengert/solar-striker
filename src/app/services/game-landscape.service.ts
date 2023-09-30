import { Application, Texture } from 'pixi.js';
import { BackgroundSprite } from '../models/pixijs/background-sprite';

export class GameLandscapeService {
  private readonly landscapes: BackgroundSprite[] = [];

  constructor(private readonly app: Application) {
  }

  setup(): void {
    if (this.landscapes.length) {
      throw new Error('do not call setup twice');
    }

    const background = new BackgroundSprite(
      0.25,
      0,
      Texture.from('assets/game/desert-background-looped.png'),
      this.app.screen.width,
      this.app.screen.height,
    );
    this.landscapes.push(background);
    this.app.stage.addChild(background);

    const cloud = new BackgroundSprite(
      0,
      0.25,
      Texture.from('assets/game/clouds-transparent.png'),
      this.app.screen.width,
      103,
      0.75,
      this.app.screen.height,
    );
    cloud.y = Math.floor(this.app.screen.height / 2);
    this.landscapes.push(cloud);
    this.app.stage.addChild(cloud);

    const cloud2 = new BackgroundSprite(
      0,
      0.27,
      Texture.from('assets/game/clouds-transparent.png'),
      this.app.screen.width,
      103,
      0.8,
      this.app.screen.height,
    );
    cloud2.y = Math.floor(this.app.screen.height / 4);
    this.landscapes.push(cloud2);
    this.app.stage.addChild(cloud2);
  }

  update(delta: number): void {
    this.landscapes.forEach(item => item.update(delta));
  }
}
