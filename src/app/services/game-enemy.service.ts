import { Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { Ship } from '../models/pixijs/ship';
import { ShipType } from '../models/pixijs/ship-type.enum';
import { BaseService } from './base.service';
import { ExplosionService } from './explosion.service';
import { GameCollectableService } from './game-collectable.service';
import { GameShotService } from './game-shot.service';

@Injectable()
export class GameEnemyService extends BaseService {
  private elapsed = 0;
  private lastEnemySpawn = -1;

  private enemySprite!: Spritesheet;

  constructor(
    private readonly collectables: GameCollectableService,
    private readonly explosionService: ExplosionService,
    private readonly shotService: GameShotService,
  ) {
    super();
  }

  async init(): Promise<void> {
    this.enemySprite = await Assets.load<Spritesheet>('assets/game/enemy.json');
  }

  update(delta: number, level: number): void {
    this.elapsed += delta;

    this.object.enemies()
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

  private spawn(level: number): void {
    const position = Math.floor(Math.random() * this.application.screen.width - 20) + 10;
    const animations: Record<string, Texture[]> = this.enemySprite.animations;
    const enemy = new Ship(ShipType.enemy, this.shotService, this.explosionService, 1 + (0.25 * (level)), animations['frame']);
    enemy.autoFire = true;
    enemy.animationSpeed = 0.167;
    enemy.play();
    enemy.anchor.set(0.5);
    enemy.x = position;
    enemy.y = 10;
    this.object.add(enemy);
    this.application.stage.addChild(enemy);
  }
}
