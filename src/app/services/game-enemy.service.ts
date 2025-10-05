import { inject, Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG, THE_MIDDLE } from '../game-constants';
import { Ship } from '../models/pixijs/ship';
import { ShipType } from '../models/pixijs/ship-type.enum';
import { ExplosionService } from './explosion.service';
import { GameShotService } from './game-shot.service';
import { ObjectService } from './object.service';
import { UpdatableService } from './updatable.service';

const halfWidth = 10;
const width = halfWidth + halfWidth;

@Injectable()
export class GameEnemyService extends UpdatableService {
  private readonly explosionService = inject(ExplosionService);
  private readonly object = inject(ObjectService);
  private readonly shotService = inject(GameShotService);

  private elapsed = 0;
  private lastEnemySpawn: number | null = null;

  private enemySprite!: Spritesheet;

  async init(): Promise<void> {
    this.enemySprite = await Assets.load<Spritesheet>('assets/game/enemies/enemy.json');
  }

  update(ticker: Ticker, level: number): void {
    this.elapsed += ticker.deltaMS;

    this.object
      .enemies()
      // eslint-disable-next-line no-magic-numbers
      .filter((enemy) => enemy.y > this.application.screen.height + 50)
      .forEach((enemy) => {
        enemy.y = 0;
      });

    const check = Math.floor(this.elapsed);
    if (
      this.object.enemies().length < GAME_CONFIG.enemy.maxCount &&
      // eslint-disable-next-line no-magic-numbers
      check % Math.floor(60 / (GAME_CONFIG.enemy.autoSpawnSpeed + 0.1 * (level - 1))) === 0 &&
      check !== this.lastEnemySpawn
    ) {
      this.lastEnemySpawn = check;
      this.spawn(level);
    }
  }

  private spawn(level: number): void {
    const animations: Record<string, Texture[]> = this.enemySprite.animations;
    // eslint-disable-next-line no-magic-numbers
    const maxSpeed = 0.4 + 0.025 * level;
    // eslint-disable-next-line no-magic-numbers
    const speedVariation = 0.6 + Math.random() * 0.4;

    const enemy = new Ship(
      ShipType.enemy,
      this.shotService,
      this.explosionService,
      maxSpeed * speedVariation,
      animations['frame'],
    );
    enemy.autoFire = true;
    enemy.animationSpeed = 0.167;
    enemy.play();
    enemy.anchor.set(THE_MIDDLE);
    enemy.x = Math.floor(Math.random() * this.application.screen.width - width) + halfWidth;
    enemy.y = 0;
    this.object.add(enemy);
    this.application.stage.addChild(enemy);
  }
}
