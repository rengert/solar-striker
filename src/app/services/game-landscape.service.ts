import { Injectable } from '@angular/core';
import { Texture } from 'pixi.js';
import { BackgroundSprite } from '../models/pixijs/background-sprite';
import { ApplicationService } from './application.service';

@Injectable()
export class GameLandscapeService {
  private readonly landscapes: BackgroundSprite[] = [];

  constructor(private readonly application: ApplicationService) {
  }

  setup(): void {
    if (this.landscapes.length) {
      throw new Error('do not call setup twice');
    }

    const background = new BackgroundSprite(
      0.25,
      0,
      Texture.from('assets/game/desert-background-looped.png'),
      this.application.screen.width,
      this.application.screen.height,
    );
    this.landscapes.push(background);
    this.application.stage.addChild(background);

    const cloud = new BackgroundSprite(
      0,
      0.25,
      Texture.from('assets/game/clouds-transparent.png'),
      this.application.screen.width,
      103,
      0.75,
      this.application.screen.height,
    );
    cloud.y = Math.floor(this.application.screen.height / 2);
    this.landscapes.push(cloud);
    this.application.stage.addChild(cloud);

    const cloud2 = new BackgroundSprite(
      0,
      0.27,
      Texture.from('assets/game/clouds-transparent.png'),
      this.application.screen.width,
      103,
      0.8,
      this.application.screen.height,
    );
    cloud2.y = Math.floor(this.application.screen.height / 4);
    this.landscapes.push(cloud2);
    this.application.stage.addChild(cloud2);
  }

  update(delta: number): void {
    this.landscapes.forEach(item => item.update(delta));
  }
}
