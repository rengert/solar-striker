import { inject, Injectable } from '@angular/core';
import { Sprite, Texture, Ticker } from 'pixi.js';
import { BackgroundSprite } from '../models/pixijs/background-sprite';
import { createDustTexture, createVignetteTexture } from '../utils/texture.util';
import { ParticleService } from './particle.service';
import { UpdatableService } from './updatable.service';

@Injectable()
export class GameLandscapeService extends UpdatableService {
  private readonly landscapes: BackgroundSprite[] = [];
  private readonly particles = inject(ParticleService);

  setup(): void {
    if (this.landscapes.length) {
      throw new Error('do not call setup twice');
    }

    this.setupBackground();
    this.setupClouds();
    this.setupDust();
    this.application.stage.addChild(this.particles.layer);
  }

  update(ticker: Ticker): void {
    this.landscapes.forEach((item) => item.update(ticker));
  }

  private setupBackground(): void {
    const background = new BackgroundSprite(Texture.from('background'), {
      speedTilePositionY: 0.025,
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
    // eslint-disable-next-line no-magic-numbers
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
    // eslint-disable-next-line no-magic-numbers
    cloud2.y = Math.floor(this.application.screen.height / 4);
    this.landscapes.push(cloud2);
    this.application.stage.addChild(cloud2);
  }

  /* eslint-disable no-magic-numbers */
  private setupDust(): void {
    const { width, height } = this.application.screen;
    // two drifting speck layers at different speeds give the desert some parallax depth
    const layers = [
      { count: 40, radius: 1, speed: 0.06, alpha: 0.35 },
      { count: 14, radius: 2, speed: 0.14, alpha: 0.5 },
    ];
    for (const layer of layers) {
      const dust = new BackgroundSprite(createDustTexture(layer.count, layer.radius), {
        speedTilePositionY: layer.speed,
        speedTilePositionX: layer.speed / 6,
        width,
        height,
      });
      dust.alpha = layer.alpha;
      dust.blendMode = 'add';
      this.landscapes.push(dust);
      this.application.stage.addChild(dust);
    }

    const vignette = new Sprite(createVignetteTexture(width, height));
    this.application.stage.addChild(vignette);
  }
  /* eslint-enable no-magic-numbers */
}
