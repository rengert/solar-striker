import { inject, Injectable } from '@angular/core';
import { Texture, Ticker } from 'pixi.js';
import { BackgroundSprite } from '../models/pixijs/background-sprite';
import { ApplicationService } from './application.service';
import { UpdatableService } from './updatable.service';

@Injectable()
export class GameLandscapeService extends UpdatableService {
  private readonly application = inject(ApplicationService);
  private readonly landscapes: BackgroundSprite[] = [];

  setup(): void {
    if (this.landscapes.length) {
      throw new Error('do not call setup twice');
    }

    this.setupBackground();
    this.setupClouds();
  }

  update(ticker: Ticker): void {
    this.landscapes.forEach((item) => item.update(ticker));
  }

  private setupBackground(): void {
    const background = new BackgroundSprite(Texture.from('background'), {
      speedTilePositionY: 0.125,
      speedTilePositionX: 0,
      width: this.application.screen.width,
      height: this.application.screen.height,
    });
    this.landscapes.push(background);
    this.application.stage.addChild(background);
  }

  private setupClouds(): void {
    const cloud = new BackgroundSprite(Texture.from('clouds'), {
      speedTilePositionY: 0,
      speedTilePositionX: 0.025,
      width: this.application.screen.width,
      height: 103,
      speedY: 0.075,
      maxY: this.application.screen.height,
    });
    cloud.y = Math.floor(this.application.screen.height / 2);
    this.landscapes.push(cloud);
    this.application.stage.addChild(cloud);

    const cloud2 = new BackgroundSprite(Texture.from('assets/game/clouds-transparent.png'), {
      speedTilePositionY: 0,
      speedTilePositionX: 0.013,
      width: this.application.screen.width,
      height: 103,
      speedY: 0.085,
      maxY: this.application.screen.height,
    });
    cloud2.y = Math.floor(this.application.screen.height / 4);
    this.landscapes.push(cloud2);
    this.application.stage.addChild(cloud2);
  }
}
