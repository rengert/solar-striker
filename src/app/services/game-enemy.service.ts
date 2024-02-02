import { Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { Rocket } from '../models/pixijs/rocket';
import { Ship } from '../models/pixijs/ship';
import { ShipType } from '../models/pixijs/ship-type.enum';
import { GameSprite } from '../models/pixijs/simple-game-sprite';
import { BaseService } from './base.service';
import { GameCollectableService } from './game-collectable.service';
import { GameShotService } from './game-shot.service';

@Injectable()
export class GameEnemyService extends BaseService {
  #enemies: AnimatedGameSprite[] = [];

  private elapsed = 0;
  private lastEnemySpawn = -1;

  private enemySprite!: Spritesheet;

  constructor(
    private readonly collectables: GameCollectableService,
    private readonly shotService: GameShotService,
  ) {
    super();
  }

  get enemies(): AnimatedGameSprite[] {
    return [...this.#enemies];
  }

  async init(): Promise<void> {
    this.enemySprite = await Assets.load<Spritesheet>('assets/game/enemy.json');
  }

  update(delta: number, level: number): void {
    this.elapsed += delta;

    this.#enemies = this.#enemies.filter(enemy => !enemy.destroyed);
    this.#enemies
      .filter(enemy => enemy.y > this.application.screen.height + 50)
      .forEach(enemy => {
        enemy.y = 0;
      });

    const check = Math.floor(this.elapsed);
    if (((check % Math.floor(60 / (GAME_CONFIG.enemy.autoSpawnSpeed + (0.1 * (level - 1))))) === 0)
      && (check !== this.lastEnemySpawn)) {
      this.lastEnemySpawn = check;
      this.spawn(level);
    }
  }

  hit(elements: Rocket[] | GameSprite[], destroyOnHit = true, spawnCollectable = true): number {
    let result = 0;
    for (const shot of elements.filter(s => !s.destroyed)) {
      const hitEnemy = this.enemies.find(enemy => !enemy.destroyed && shot.hit(enemy));
      if (hitEnemy) {
        this.explode(hitEnemy.x, hitEnemy.y, explosion => {
          if (spawnCollectable) {
            this.collectables.spawn(explosion.x, explosion.y);
          }
        });
        hitEnemy.destroy();
        if (destroyOnHit) {
          shot.destroy();
        }
        result++;
      }
    }

    return result;
  }

  kill(ship: AnimatedGameSprite | undefined): boolean {
    if (!ship || ship.destroyed) {
      return false;
    }

    const hitEnemy = this.enemies.find(enemy => !enemy.destroyed && ship.hit(enemy));
    if (hitEnemy) {
      this.explode(hitEnemy.x, hitEnemy.y);
      hitEnemy.destroy();

      return true;
    }
    return false;
  }

  private spawn(level: number): void {
    const position = Math.floor(Math.random() * this.application.screen.width - 20) + 10;
    const animations: Record<string, Texture[]> = this.enemySprite.animations;
    const enemy = new Ship(ShipType.enemy, this.shotService, 1 + (0.25 * (level)), animations['frame']);
    enemy.autoFire = true;
    enemy.animationSpeed = 0.167;
    enemy.play();
    enemy.anchor.set(0.5);
    enemy.x = position;
    enemy.y = 10;
    this.#enemies.push(enemy);
    this.application.stage.addChild(enemy);
  }
}
