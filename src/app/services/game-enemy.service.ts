import { inject, Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG, OFF_SCREEN_BUFFER, THE_MIDDLE } from '../game-constants';
import { AnimatedGameSprite, LoopData, OrbitData } from '../models/pixijs/animated-game-sprite';
import { Ship } from '../models/pixijs/ship';
import { ShipType } from '../models/pixijs/ship-type.enum';
import { ExplosionService } from './explosion.service';
import { GameScreenService } from './game-screen.service';
import { GameShotService } from './game-shot.service';
import { ObjectModelType, ObjectService } from './object.service';
import { UpdatableService } from './updatable.service';

const halfWidth = 10;
const MOVEMENT_TARGET_SNAP_DISTANCE = 5;
const MOVEMENT_MIN_DISTANCE_RATIO = 0.08;
const MOVEMENT_MIN_DISTANCE_PIXELS = 40;
const MOVEMENT_MAX_DISTANCE_RATIO = 0.22;
const MOVEMENT_MAX_DISTANCE_PIXELS = 110;
// eslint-disable-next-line no-magic-numbers
const MOVEMENT_REVERSE_DIRECTION_MULTIPLIER = -1;
const MOVEMENT_DIRECTIONS = Object.freeze([
  MOVEMENT_REVERSE_DIRECTION_MULTIPLIER,
  Math.abs(MOVEMENT_REVERSE_DIRECTION_MULTIPLIER),
] as const);
const MOVEMENT_BASE_DELAY = 500;
const MOVEMENT_RANDOM_DELAY_MIN = 350;
const MOVEMENT_RANDOM_DELAY_RANGE = 400;
const MOVEMENT_LEVEL_ACCELERATION = 25;
const MOVEMENT_LEVEL_ACCELERATION_CAP = 10;
const MOVEMENT_MIN_DELAY = 250;
const ENEMY_BASE_ENERGY = 1;
const ENEMY_ENERGY_LEVEL_STEP = 3;
const LOOP_CHANCE = 0.15;
const LOOP_RADIUS = 70;
const LOOP_DURATION_MS = 2500;
// eslint-disable-next-line no-magic-numbers
const LOOP_ANGULAR_SPEED = (Math.PI * 2) / LOOP_DURATION_MS;
// eslint-disable-next-line no-magic-numbers
const LOOP_MIN_START_Y = LOOP_RADIUS * 2;
const ENEMY_XSPEED = 0.05;
const LARGE_ENEMY_SPAWN_CHANCE = 0.15;
const LARGE_ENEMY_SCALE = 2;
const LARGE_ENEMY_ENERGY_MULTIPLIER = 3;
const LARGE_ENEMY_SPEED_MULTIPLIER = 1.5;
const LARGE_ENEMY_SHOT_SPEED = 0.8;
const LARGE_ENEMY_XSPEED = 0.08;
const LARGE_ENEMY_EXPLOSION_COUNT = 3;
const LARGE_ENEMY_EXPLOSION_SCALE = 2;

const ORBITER_SPAWN_CHANCE = 0.12;
const ORBITER_ORBIT_RADIUS = 45;
// eslint-disable-next-line no-magic-numbers
const ORBITER_ORBIT_DIAMETER = ORBITER_ORBIT_RADIUS * 2;
// eslint-disable-next-line no-magic-numbers
const ORBITER_ANGULAR_SPEED = (Math.PI * 2) / 2000;
const ORBITER_SCALE = 1.2;
const ORBITER_SHOT_SPEED = 0.5;
// eslint-disable-next-line no-magic-numbers
const ORBITER_TINT = 0x88ffff;

const BOSS_ENERGY_BASE = 30;
const BOSS_ENERGY_LEVEL_STEP = 5;
const BOSS_SCALE = 3;
const BOSS_SPEED = 0.12;
const BOSS_SHOT_SPEED = 0.8;
const BOSS_SHOT_POWER = 3;
const BOSS_XSPEED = 0.035;
// eslint-disable-next-line no-magic-numbers
const BOSS_TINT = 0xff3333;
const BOSS_SWEEP_MARGIN = 30;
const BOSS_SWEEP_INTERVAL_MS = 3000;
const BOSS_SCREEN_CENTER_DIVIDER = 2;
const BOSS_EXPLOSION_COUNT = 5;
const BOSS_EXPLOSION_SCALE = 3;
const ENEMY_ANIMATION_SPEED = 0.167;

interface EnemyMovementState {
  nextChange: number;
  targetX?: number;
}

@Injectable()
export class GameEnemyService extends UpdatableService {
  private readonly explosionService = inject(ExplosionService);
  private readonly object = inject(ObjectService);
  private readonly shotService = inject(GameShotService);
  private readonly gameScreen = inject(GameScreenService);

  /** Set to true by GameService when the stage boss is active; prevents normal enemy spawning. */
  bossFightActive = false;

  private elapsed = 0;
  private lastEnemySpawn: number | null = null;
  private boss: Ship | null = null;

  private enemySprite!: Spritesheet;
  private readonly movementStates = new WeakMap<ObjectModelType, EnemyMovementState>();

  async init(): Promise<void> {
    this.enemySprite = await Assets.load<Spritesheet>('assets/game/enemies/enemy.json');
  }

  update(ticker: Ticker, level: number): void {
    this.elapsed += ticker.deltaMS;

    if (this.boss?.destroying || this.boss?.destroyed) {
      this.boss = null;
    }

    const enemies = this.object.enemies();

    enemies
      .filter((enemy) => {
        if (enemy instanceof AnimatedGameSprite && enemy.orbitData !== undefined) {
          return enemy.orbitData.centerY > this.application.screen.height + OFF_SCREEN_BUFFER + enemy.orbitData.radius;
        }
        return enemy.y > this.application.screen.height + OFF_SCREEN_BUFFER;
      })
      .forEach((enemy) => {
        if (enemy instanceof AnimatedGameSprite && enemy.orbitData !== undefined) {
          enemy.orbitData.centerX = Math.random() * this.application.screen.width;
          enemy.orbitData.centerY = -enemy.orbitData.radius;
          enemy.orbitData.angle = 0;
          if (enemy instanceof Ship) {
            enemy.energy = enemy.maxEnergy;
          }
        } else {
          enemy.y = 0;
          enemy.targetX = undefined;
          enemy.rotation = 0;
          if (enemy instanceof Ship) {
            enemy.energy = enemy.maxEnergy;
          }
          if (enemy instanceof AnimatedGameSprite) {
            enemy.loopData = undefined;
          }
          this.movementStates.delete(enemy);
        }
      });

    enemies.forEach((enemy) => this.updateMovement(enemy, level));

    const check = Math.floor(this.elapsed);
    if (
      !this.bossFightActive &&
      this.object.enemies().length < GAME_CONFIG.enemy.maxCount &&
      // eslint-disable-next-line no-magic-numbers
      check % Math.floor(60 / (GAME_CONFIG.enemy.autoSpawnSpeed + 0.1 * (level - 1))) === 0 &&
      check !== this.lastEnemySpawn
    ) {
      this.lastEnemySpawn = check;
      this.spawn(level);
    }
  }

  /** Called by GameService when the player has defeated enough enemies to trigger the stage boss. */
  spawnStageBoss(stage: number): void {
    this.spawnBoss(stage);
    this.gameScreen.showBossWarning();
  }

  private spawn(level: number): void {
    const animations: Record<string, Texture[]> = this.enemySprite.animations;
    const isOrbiter = Math.random() < ORBITER_SPAWN_CHANCE;
    if (isOrbiter) {
      this.spawnOrbiter(level, animations);
      return;
    }
    const isLarge = Math.random() < LARGE_ENEMY_SPAWN_CHANCE;
    // eslint-disable-next-line no-magic-numbers
    const maxSpeed = 0.5 + 0.03 * level;
    // eslint-disable-next-line no-magic-numbers
    const speedVariation = 0.6 + Math.random() * 0.4;
    const speedMultiplier = isLarge ? LARGE_ENEMY_SPEED_MULTIPLIER : 1;

    const enemy = new Ship(
      ShipType.enemy,
      this.shotService,
      this.explosionService,
      maxSpeed * speedVariation * speedMultiplier,
      animations['frame'],
    );
    enemy.autoFire = true;
    enemy.animationSpeed = ENEMY_ANIMATION_SPEED;
    enemy.play();
    enemy.anchor.set(THE_MIDDLE);
    const levelEnergy = ENEMY_BASE_ENERGY + Math.floor((level - 1) / ENEMY_ENERGY_LEVEL_STEP);
    if (isLarge) {
      enemy.scale.set(LARGE_ENEMY_SCALE);
      const largeEnergy = levelEnergy * LARGE_ENEMY_ENERGY_MULTIPLIER;
      enemy.maxEnergy = largeEnergy;
      enemy.energy = largeEnergy;
      enemy.shotSpeed = LARGE_ENEMY_SHOT_SPEED;
      enemy.xSpeed = LARGE_ENEMY_XSPEED * speedVariation;
      enemy.explosionCount = LARGE_ENEMY_EXPLOSION_COUNT;
      enemy.explosionScale = LARGE_ENEMY_EXPLOSION_SCALE;
    } else {
      enemy.xSpeed = ENEMY_XSPEED * speedVariation;
      enemy.maxEnergy = levelEnergy;
      enemy.energy = levelEnergy;
    }
    // eslint-disable-next-line no-magic-numbers
    const enemyHalfWidth = enemy.width / 2;
    const usableWidth = Math.max(0, this.application.screen.width - enemy.width);
    enemy.x = Math.floor(Math.random() * usableWidth) + enemyHalfWidth;
    enemy.y = 0;
    enemy.enableEnergyDisplay();
    this.object.add(enemy);
    this.application.stage.addChild(enemy);

    this.updateMovement(enemy, level, true);
  }

  private spawnOrbiter(level: number, animations: Record<string, Texture[]>): void {
    // eslint-disable-next-line no-magic-numbers
    const speed = 0.4 + 0.02 * level;
    const orbiter = new Ship(
      ShipType.enemy,
      this.shotService,
      this.explosionService,
      speed,
      animations['frame'],
    );
    orbiter.autoFire = true;
    orbiter.animationSpeed = ENEMY_ANIMATION_SPEED;
    orbiter.play();
    orbiter.anchor.set(THE_MIDDLE);
    orbiter.scale.set(ORBITER_SCALE);
    // eslint-disable-next-line no-magic-numbers
    orbiter.tint = ORBITER_TINT;
    orbiter.shotSpeed = ORBITER_SHOT_SPEED;
    const levelEnergy = ENEMY_BASE_ENERGY + Math.floor((level - 1) / ENEMY_ENERGY_LEVEL_STEP);
    orbiter.maxEnergy = levelEnergy;
    orbiter.energy = levelEnergy;

    const centerX = ORBITER_ORBIT_RADIUS + Math.random() * (this.application.screen.width - ORBITER_ORBIT_DIAMETER);
    // eslint-disable-next-line no-magic-numbers
    const direction = (Math.random() < 0.5 ? 1 : -1) as 1 | -1;    const orbitData: OrbitData = {
      centerX,
      centerY: -ORBITER_ORBIT_RADIUS,
      radius: ORBITER_ORBIT_RADIUS,
      direction,
      angularSpeed: ORBITER_ANGULAR_SPEED,
      angle: 0,
    };
    orbiter.orbitData = orbitData;
    orbiter.x = orbitData.centerX + ORBITER_ORBIT_RADIUS;
    orbiter.y = orbitData.centerY;
    orbiter.enableEnergyDisplay();
    this.object.add(orbiter);
    this.application.stage.addChild(orbiter);
  }

  private updateMovement(enemy: ObjectModelType, level: number, force = false): void {
    if (enemy instanceof AnimatedGameSprite && enemy.isBoss) {
      this.updateBossMovement(enemy);
      return;
    }

    // Orbiters self-navigate via orbitData - no additional movement logic needed
    if (enemy instanceof AnimatedGameSprite && enemy.orbitData !== undefined) {
      return;
    }

    const screenWidth = this.application.screen.width;
    const movement = this.getMovementState(enemy);

    if (enemy instanceof AnimatedGameSprite && enemy.loopData) {
      return;
    }

    const shouldPickNewTarget =
      force ||
      movement.nextChange <= this.elapsed ||
      movement.targetX === undefined ||
      Math.abs((movement.targetX ?? enemy.x) - enemy.x) < MOVEMENT_TARGET_SNAP_DISTANCE;

    if (shouldPickNewTarget) {
      if (!force && Math.random() < LOOP_CHANCE && enemy instanceof AnimatedGameSprite
        && enemy.y >= LOOP_MIN_START_Y) {
        // eslint-disable-next-line no-magic-numbers
        const direction = MOVEMENT_DIRECTIONS[Math.floor(Math.random() * MOVEMENT_DIRECTIONS.length)] as 1 | -1;
        const loopData: LoopData = {
          startX: enemy.x,
          startY: enemy.y,
          radius: LOOP_RADIUS,
          direction,
          progress: 0,
          speed: LOOP_ANGULAR_SPEED,
        };
        enemy.loopData = loopData;
        enemy.targetX = undefined;
        movement.targetX = undefined;
        movement.nextChange = this.elapsed + LOOP_DURATION_MS + this.getNextChangeDelay(level);
      } else {
        // eslint-disable-next-line no-magic-numbers
        const enemyHalfWidth = enemy instanceof AnimatedGameSprite ? enemy.width / 2 : halfWidth;
        movement.targetX = this.getNextHorizontalTarget(enemy.x, screenWidth, enemyHalfWidth);
        movement.nextChange = this.elapsed + this.getNextChangeDelay(level);
      }
    }

    if (movement.targetX !== undefined) {
      enemy.targetX = movement.targetX;
    }
  }

  private spawnBoss(stage: number): void {
    const animations: Record<string, Texture[]> = this.enemySprite.animations;
    const bossEnergy = BOSS_ENERGY_BASE + BOSS_ENERGY_LEVEL_STEP * (stage - 1);

    const boss = new Ship(
      ShipType.enemy,
      this.shotService,
      this.explosionService,
      BOSS_SPEED,
      animations['frame'],
    );
    boss.isBoss = true;
    boss.autoFire = true;
    boss.animationSpeed = ENEMY_ANIMATION_SPEED;
    boss.play();
    boss.anchor.set(THE_MIDDLE);
    boss.scale.set(BOSS_SCALE);
    boss.maxEnergy = bossEnergy;
    boss.energy = bossEnergy;
    boss.shotSpeed = BOSS_SHOT_SPEED;
    boss.shotPower = BOSS_SHOT_POWER;
    boss.xSpeed = BOSS_XSPEED;
    boss.explosionCount = BOSS_EXPLOSION_COUNT;
    boss.explosionScale = BOSS_EXPLOSION_SCALE;
    // eslint-disable-next-line no-magic-numbers
    boss.tint = BOSS_TINT;
    boss.x = this.application.screen.width / BOSS_SCREEN_CENTER_DIVIDER;
    boss.y = 0;
    boss.enableEnergyDisplay();
    this.object.add(boss);
    this.application.stage.addChild(boss);
    this.boss = boss;

    this.updateBossMovement(boss);
  }

  private updateBossMovement(boss: AnimatedGameSprite): void {
    const movement = this.getMovementState(boss);
    const screenWidth = this.application.screen.width;
    const bossHalfWidth = boss.width / BOSS_SCREEN_CENTER_DIVIDER;
    const margin = bossHalfWidth + BOSS_SWEEP_MARGIN;

    const isAtTarget =
      movement.targetX !== undefined &&
      Math.abs(movement.targetX - boss.x) < MOVEMENT_TARGET_SNAP_DISTANCE;
    const isOverdue = movement.nextChange <= this.elapsed;

    if (movement.targetX === undefined || isAtTarget || isOverdue) {
      const rightTarget = screenWidth - margin;
      const leftTarget = margin;
      const currentTarget = movement.targetX;
      movement.targetX =
        currentTarget === undefined || currentTarget > screenWidth / BOSS_SCREEN_CENTER_DIVIDER
          ? leftTarget
          : rightTarget;
      movement.nextChange = this.elapsed + BOSS_SWEEP_INTERVAL_MS;
    }

    boss.targetX = movement.targetX;
  }

  private getMovementState(enemy: ObjectModelType): EnemyMovementState {
    if (!this.movementStates.has(enemy)) {
      this.movementStates.set(enemy, { nextChange: 0 });
    }
    // Non-null assertion safe: we just set it when missing.
    return this.movementStates.get(enemy)!;
  }

  private getNextHorizontalTarget(currentX: number, screenWidth: number, enemyHalfWidth: number): number {
    const minDistance = Math.max(
      screenWidth * MOVEMENT_MIN_DISTANCE_RATIO,
      MOVEMENT_MIN_DISTANCE_PIXELS,
    );
    const maxDistance = Math.max(
      screenWidth * MOVEMENT_MAX_DISTANCE_RATIO,
      MOVEMENT_MAX_DISTANCE_PIXELS,
    );
    const preferredDirection =
      MOVEMENT_DIRECTIONS[Math.floor(Math.random() * MOVEMENT_DIRECTIONS.length)];
    const travelDistance = minDistance + Math.random() * (maxDistance - minDistance);

    let candidate = currentX + preferredDirection * travelDistance;
    const minX = enemyHalfWidth;
    const maxX = screenWidth - enemyHalfWidth;

    if (candidate < minX || candidate > maxX) {
      candidate =
        currentX + preferredDirection * MOVEMENT_REVERSE_DIRECTION_MULTIPLIER * travelDistance;
    }

    candidate = Math.min(maxX, Math.max(minX, candidate));

    return candidate;
  }

  private getNextChangeDelay(level: number): number {
    const randomDelay = MOVEMENT_RANDOM_DELAY_MIN + Math.random() * MOVEMENT_RANDOM_DELAY_RANGE;
    const levelAcceleration =
      Math.min(Math.max(level - 1, 0), MOVEMENT_LEVEL_ACCELERATION_CAP) *
      MOVEMENT_LEVEL_ACCELERATION;

    return Math.max(MOVEMENT_MIN_DELAY, MOVEMENT_BASE_DELAY + randomDelay - levelAcceleration);
  }
}
