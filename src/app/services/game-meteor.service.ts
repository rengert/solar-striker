import { inject, Injectable } from '@angular/core';
import { Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { GameSprite } from '../models/pixijs/simple-game-sprite';
import { ExplosionService } from './explosion.service';
import { ObjectService } from './object.service';
import { UpdatableService } from './updatable.service';

@Injectable()
export class GameMeteorService extends UpdatableService {
  private readonly explosionService = inject(ExplosionService);
  private readonly object = inject(ObjectService);

  private elapsed = 0;
  // eslint-disable-next-line no-magic-numbers
  private lastMeteorSpawn = -1;

  update(ticker: Ticker, level: number): void {
    this.elapsed += ticker.deltaMS;

    this.object
      .meteors()
      // eslint-disable-next-line no-magic-numbers
      .filter((meteor) => meteor.y > this.application.screen.height + 50)
      .forEach((meteor) => meteor.destroy());

    const check = Math.floor(this.elapsed);
    if (
      // eslint-disable-next-line no-magic-numbers
      check % Math.floor(60 / (GAME_CONFIG.meteor.autoSpawnSpeed + 0.1 * (level - 1))) === 0 &&
      check !== this.lastMeteorSpawn
    ) {
      this.lastMeteorSpawn = check;
      this.spawn(level);
    }
  }

  private spawn(level: number): void {
    // eslint-disable-next-line no-magic-numbers
    const position = Math.floor(Math.random() * this.application.screen.width - 20) + 10;
    // eslint-disable-next-line no-magic-numbers
    const index = Math.floor(Math.random() * 4) + 1;
    const meteor = new GameSprite(
      ObjectType.meteor,
      this.explosionService,
      // eslint-disable-next-line no-magic-numbers
      0.1 + 0.125 * level,
      Texture.from(`meteor${index}`),
    );
    // eslint-disable-next-line no-magic-numbers
    meteor.anchor.set(0.5);
    meteor.x = position;
    meteor.y = 10;
    // eslint-disable-next-line no-magic-numbers
    meteor.width += Math.random() * 20;
    // eslint-disable-next-line no-magic-numbers
    meteor.height += Math.random() * 20;
    meteor.energy = 10;
    this.object.add(meteor);
    this.application.stage.addChild(meteor);
  }
}
