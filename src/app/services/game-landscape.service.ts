import { inject, Injectable } from '@angular/core';
import { Texture } from 'pixi.js';
import { BackgroundSprite } from '../models/pixijs/background-sprite';
import { ApplicationService } from './application.service';

@Injectable()
export class GameLandscapeService {
  private readonly application = inject(ApplicationService);
  private readonly landscapes: BackgroundSprite[] = [];

  setup(): void {
    if (this.landscapes.length) {
      throw new Error('do not call setup twice');
    }

    const background = new BackgroundSprite(
      Texture.from('assets/game/desert-background-looped.png'),
      {
        speedTilePositionY: 0.25,
        speedTilePositionX: 0,
        width: this.application.screen.width,
        height: this.application.screen.height,
      },
    );
    this.landscapes.push(background);
    this.application.stage.addChild(background);

    const cloud = new BackgroundSprite(
      Texture.from('assets/game/clouds-transparent.png'),
      {
        speedTilePositionY: 0,
        speedTilePositionX: 0.25,
        width: this.application.screen.width,
        height: 103,
        speedY: 0.75,
        maxY: this.application.screen.height,
      },
    );
    cloud.y = Math.floor(this.application.screen.height / 2);
    this.landscapes.push(cloud);
    this.application.stage.addChild(cloud);

    const cloud2 = new BackgroundSprite(
      Texture.from('assets/game/clouds-transparent.png'),
      {
        speedTilePositionY: 0,
        speedTilePositionX: 0.30,
        width: this.application.screen.width,
        height: 103,
        speedY: 0.85,
        maxY: this.application.screen.height,
      },
    );
    cloud2.y = Math.floor(this.application.screen.height / 4);
    this.landscapes.push(cloud2);
    this.application.stage.addChild(cloud2);
  }

  update(delta: number): void {
    this.landscapes.forEach(item => item.update(delta));
  }
}
