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
const MOVEMENT_TARGET_SNAP_DISTANCE = 5;
const MOVEMENT_MIN_DISTANCE_RATIO = 0.08;
const MOVEMENT_MIN_DISTANCE_PIXELS = 40;
const MOVEMENT_MAX_DISTANCE_RATIO = 0.22;
const MOVEMENT_MAX_DISTANCE_PIXELS = 110;
// eslint-disable-next-line no-magic-numbers
const MOVEMENT_REVERSE_DIRECTION_MULTIPLIER = -1;
const MOVEMENT_DIRECTIONS = Object.freeze(
  [
    MOVEMENT_REVERSE_DIRECTION_MULTIPLIER,
    Math.abs(MOVEMENT_REVERSE_DIRECTION_MULTIPLIER),
  ] as const,
);
const MOVEMENT_BASE_DELAY = 650;
const MOVEMENT_RANDOM_DELAY_MIN = 450;
const MOVEMENT_RANDOM_DELAY_RANGE = 400;
const MOVEMENT_LEVEL_ACCELERATION = 25;
const MOVEMENT_LEVEL_ACCELERATION_CAP = 10;
const MOVEMENT_MIN_DELAY = 350;

interface EnemyMovementState {
  nextChange: number;
  targetX?: number;
}

@Injectable()
export class GameEnemyService extends UpdatableService {
  private readonly explosionService = inject(ExplosionService);
  private readonly object = inject(ObjectService);
  private readonly shotService = inject(GameShotService);

  private elapsed = 0;
  private lastEnemySpawn: number | null = null;

  private enemySprite!: Spritesheet;
  private readonly movementStates = new WeakMap<Ship, EnemyMovementState>();

  async init(): Promise<void> {
    this.enemySprite = await Assets.load<Spritesheet>('assets/game/enemies/enemy.json');
  }

  update(ticker: Ticker, level: number): void {
    this.elapsed += ticker.deltaMS;

    const enemies = this.object.enemies();

    enemies
      // eslint-disable-next-line no-magic-numbers
      .filter((enemy) => enemy.y > this.application.screen.height + 50)
      .forEach((enemy) => {
        enemy.y = 0;
        enemy.targetX = undefined;
        this.movementStates.delete(enemy);
      });

    enemies.forEach((enemy) => this.updateMovement(enemy, level));

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

    this.updateMovement(enemy, level, true);
  }

  private updateMovement(enemy: Ship, level: number, force = false): void {
    const screenWidth = this.application.screen.width;
    const movement = this.getMovementState(enemy);

    const shouldPickNewTarget =
      force ||
      movement.nextChange <= this.elapsed ||
      movement.targetX === undefined ||
      Math.abs((movement.targetX ?? enemy.x) - enemy.x) < MOVEMENT_TARGET_SNAP_DISTANCE;

    if (shouldPickNewTarget) {
      movement.targetX = this.getNextHorizontalTarget(enemy.x, screenWidth);
      movement.nextChange = this.elapsed + this.getNextChangeDelay(level);
    }

    if (movement.targetX !== undefined) {
      enemy.targetX = movement.targetX;
    }
  }

  private getMovementState(enemy: Ship): EnemyMovementState {
    if (!this.movementStates.has(enemy)) {
      this.movementStates.set(enemy, { nextChange: 0 });
    }
    // Non-null assertion safe: we just set it when missing.
    return this.movementStates.get(enemy)!;
  }

  private getNextHorizontalTarget(currentX: number, screenWidth: number): number {
    const minDistance = Math.max(screenWidth * MOVEMENT_MIN_DISTANCE_RATIO, MOVEMENT_MIN_DISTANCE_PIXELS);
    const maxDistance = Math.max(screenWidth * MOVEMENT_MAX_DISTANCE_RATIO, MOVEMENT_MAX_DISTANCE_PIXELS);
    const preferredDirection =
      MOVEMENT_DIRECTIONS[Math.floor(Math.random() * MOVEMENT_DIRECTIONS.length)];
    const travelDistance = minDistance + Math.random() * (maxDistance - minDistance);

    let candidate = currentX + preferredDirection * travelDistance;
    const minX = halfWidth;
    const maxX = screenWidth - halfWidth;

    if (candidate < minX || candidate > maxX) {
      candidate = currentX + preferredDirection * MOVEMENT_REVERSE_DIRECTION_MULTIPLIER * travelDistance;
    }

    candidate = Math.min(maxX, Math.max(minX, candidate));

    return candidate;
  }

  private getNextChangeDelay(level: number): number {
    const randomDelay = MOVEMENT_RANDOM_DELAY_MIN + Math.random() * MOVEMENT_RANDOM_DELAY_RANGE;
    const levelAcceleration =
      Math.min(Math.max(level - 1, 0), MOVEMENT_LEVEL_ACCELERATION_CAP) * MOVEMENT_LEVEL_ACCELERATION;

    return Math.max(MOVEMENT_MIN_DELAY, MOVEMENT_BASE_DELAY + randomDelay - levelAcceleration);
  }
}
