import { inject, Injectable } from '@angular/core';
import { Assets, Container, Graphics, Rectangle, Sprite, Spritesheet, Text, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG, getDifficultyLevel, MAX_STAGE, OFF_SCREEN_BUFFER, THE_MIDDLE } from '../game-constants';
import { AnimatedGameSprite, LoopData, OrbitData } from '../models/pixijs/animated-game-sprite';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { CURRENT_SEASON_EVENT } from '../models/season-event.model';
import { Ship } from '../models/pixijs/ship';
import { ShipType } from '../models/pixijs/ship-type.enum';
import { ExplosionService } from './explosion.service';
import { GameScreenService } from './game-screen.service';
import { GameShotService } from './game-shot.service';
import { ObjectModelType, ObjectService } from './object.service';
import { UpdatableService } from './updatable.service';
import { createGlowTexture } from '../utils/texture.util';

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

/** Regular enemies with their own flight style; each also gets its own colour, size and glow. */
export enum EnemyKind {
  diver = 'diver',
  weaver = 'weaver',
  sniper = 'sniper',
  bomber = 'bomber',
  phantom = 'phantom',
}

interface EnemyKindDefinition {
  readonly spawnChance: number;
  readonly tint: number;
  readonly scale: number;
  readonly energyMultiplier: number;
  readonly speed: number;
  readonly autoFire: boolean;
  /** Only spawns in endless mode, so stage 101+ shows something new. */
  readonly endlessOnly?: boolean;
}

/* eslint-disable no-magic-numbers */
const ENEMY_KIND_DEFINITIONS: Record<EnemyKind, EnemyKindDefinition> = {
  // drifts in slowly, then locks onto the player and rams them
  [EnemyKind.diver]: { spawnChance: 0.1, tint: 0xff5533, scale: 0.85, energyMultiplier: 1, speed: 0.3, autoFire: false },
  // snakes down in wide sine waves while shooting
  [EnemyKind.weaver]: { spawnChance: 0.1, tint: 0x66ff88, scale: 1, energyMultiplier: 1, speed: 0.45, autoFire: true },
  // parks near the top, fires aimed shots, then leaves
  [EnemyKind.sniper]: { spawnChance: 0.08, tint: 0xffee44, scale: 1.4, energyMultiplier: 2, speed: 0.5, autoFire: false },
  // slow and tough, drops a ring of shots every few seconds
  [EnemyKind.bomber]: { spawnChance: 0.08, tint: 0xff66cc, scale: 1.6, energyMultiplier: 3, speed: 0.25, autoFire: false, endlessOnly: true },
  // blinks to a new spot and fires right after it reappears
  [EnemyKind.phantom]: { spawnChance: 0.08, tint: 0x8888ff, scale: 1, energyMultiplier: 1, speed: 0.35, autoFire: false, endlessOnly: true },
};
/* eslint-enable no-magic-numbers */
const ENEMY_KINDS = Object.values(EnemyKind);
const ENEMY_GLOW_SIZE_FACTOR = 1.8;
const ENEMY_GLOW_ALPHA = 0.45;
const DIVER_TRIGGER_Y_RATIO = 0.3;
const DIVER_DIVE_SPEED = 0.45;
const KIND_XSPEED = 0.15;
const WEAVER_AMPLITUDE = 60;
// eslint-disable-next-line no-magic-numbers
const WEAVER_ANGULAR_SPEED = (Math.PI * 2) / 1800;
const SNIPER_HOLD_Y_RATIO = 0.2;
const SNIPER_HOLD_MS = 5000;
const SNIPER_SHOT_INTERVAL_MS = 1400;
const SNIPER_SHOT_SPEED = 0.7;
const BOMBER_RING_COUNT = 8;
const BOMBER_SHOT_INTERVAL_MS = 2400;
const BOMBER_SHOT_SPEED = 0.35;
const PHANTOM_BLINK_INTERVAL_MS = 1500;
const PHANTOM_SHOT_SPEED = 0.6;
const PHANTOM_FADE_IN_MS = 400;
const PHANTOM_BLINK_ALPHA = 0.2;
const PHANTOM_MIN_Y_RATIO = 0.1;

const BOSS_ENERGY_BASE = 30;
const BOSS_ENERGY_LEVEL_STEP = 5;
const BOSS_SCALE = 3;
const BOSS_SPEED = 0.12;
const BOSS_SHOT_SPEED = 0.8;
const BOSS_SHOT_POWER = 3;
const BOSS_SWEEP_MARGIN = 30;
const BOSS_SWEEP_INTERVAL_MS = 3000;
const BOSS_SCREEN_CENTER_DIVIDER = 2;
const BOSS_EXPLOSION_COUNT = 5;
const BOSS_EXPLOSION_SCALE = 3;
const DOUBLE = 2;
const BOSS_BAR_WIDTH_RATIO = 0.6;
const BOSS_BAR_HEIGHT = 8;
const BOSS_BAR_Y = 100;
const BOSS_BAR_BORDER = 2;
const BOSS_BAR_BACKGROUND = 0x330000;
const BOSS_BAR_BORDER_COLOR = 0xffffff;
const ENEMY_ANIMATION_SPEED = 0.167;

/**
 * Each campaign boss uses one of the first three, in turn: sweeper (stage 1, 4, ...), orbiter (2, 5, ...), hunter (3, 6, ...).
 * Endless mode (stage 101+) rotates through all five, starting with the spiral.
 */
export enum BossPattern {
  sweeper = 'sweeper',
  orbiter = 'orbiter',
  hunter = 'hunter',
  spiral = 'spiral',
  warper = 'warper',
}

interface BossDefinition {
  readonly tint: number;
  /** The normal 3-shot autofire runs alongside the special attack. */
  readonly autoFire: boolean;
  readonly attackIntervalMs: number;
  readonly xSpeed: number;
}

const BOSS_PATTERNS = [BossPattern.sweeper, BossPattern.orbiter, BossPattern.hunter] as const;
const ENDLESS_BOSS_PATTERNS = [
  BossPattern.spiral, BossPattern.sweeper, BossPattern.warper, BossPattern.orbiter, BossPattern.hunter,
] as const;
/* eslint-disable no-magic-numbers */
const BOSS_DEFINITIONS: Record<BossPattern, BossDefinition> = {
  [BossPattern.sweeper]: { tint: 0xff3333, autoFire: true, attackIntervalMs: 2600, xSpeed: 0.035 },
  [BossPattern.orbiter]: { tint: 0xcc55ff, autoFire: false, attackIntervalMs: 2200, xSpeed: 0 },
  [BossPattern.hunter]: { tint: 0xffaa22, autoFire: false, attackIntervalMs: 1600, xSpeed: 0.06 },
  [BossPattern.spiral]: { tint: 0x33ffcc, autoFire: false, attackIntervalMs: 400, xSpeed: 0.02 },
  [BossPattern.warper]: { tint: 0x55aaff, autoFire: true, attackIntervalMs: 2000, xSpeed: 0 },
};
/* eslint-enable no-magic-numbers */
const BOSS_HOVER_Y_RATIO = 0.25;
const BOSS_HOVER_Y_MIN = 170;
/** Below this share of energy the boss attacks faster. */
const BOSS_ENRAGE_RATIO = 0.5;
const BOSS_ENRAGE_INTERVAL_FACTOR = 0.6;
const BOSS_RADIAL_SHOT_SPEED = 0.6;
const BOSS_FAN_COUNT = 5;
// eslint-disable-next-line no-magic-numbers
const BOSS_FAN_ARC = Math.PI / 3;
const BOSS_RING_COUNT = 12;
const BOSS_AIMED_COUNT = 3;
// eslint-disable-next-line no-magic-numbers
const BOSS_AIMED_ARC = Math.PI / 12;
const BOSS_ORBIT_RADIUS_X_RATIO = 0.3;
const BOSS_ORBIT_RADIUS_Y = 40;
// eslint-disable-next-line no-magic-numbers
const BOSS_ORBIT_ANGULAR_SPEED = (Math.PI * 2) / 6000;
// eslint-disable-next-line no-magic-numbers
const DOWN = Math.PI / 2;
const BOSS_SPIRAL_ARMS = 2;
const BOSS_SPIRAL_STEP = 0.35;
const BOSS_WARP_COUNT = 5;
// eslint-disable-next-line no-magic-numbers
const BOSS_WARP_ARC = Math.PI / 6;

interface EnemyMovementState {
  nextChange: number;
  targetX?: number;
  bossPattern?: BossPattern;
  nextAttack?: number;
  orbitAngle?: number;
  bossArrived?: boolean;
  /** Diver only: the dive has started. */
  diving?: boolean;
  /** Weaver only: x the wave swings around. */
  weaveCenterX?: number;
  /** Sniper only: when it leaves its post. */
  leaveAt?: number;
  /** Spiral boss only: where the next pair of shots starts. */
  spiralAngle?: number;
}

/** Frames between enemy spawns; never below 1, otherwise endless stages past ~600 would stop spawning. */
export function getSpawnInterval(level: number): number {
  // eslint-disable-next-line no-magic-numbers
  return Math.max(1, Math.floor(60 / (GAME_CONFIG.enemy.autoSpawnSpeed + 0.1 * (level - 1))));
}

export function getBossPattern(stage: number): BossPattern {
  if (stage > MAX_STAGE) {
    return ENDLESS_BOSS_PATTERNS[(stage - MAX_STAGE - 1) % ENDLESS_BOSS_PATTERNS.length];
  }
  return BOSS_PATTERNS[(Math.max(1, stage) - 1) % BOSS_PATTERNS.length];
}

@Injectable()
export class GameEnemyService extends UpdatableService {
  private readonly explosionService = inject(ExplosionService);
  private readonly object = inject(ObjectService);
  private readonly shotService = inject(GameShotService);
  private readonly gameScreen = inject(GameScreenService);

  /** Set to true by GameService when the stage boss is active; prevents normal enemy spawning. */
  bossFightActive = false;
  /** Spawn rate multiplier, raised by the weekly swarm rule. */
  spawnFactor = 1;
  /** Set by GameService in endless mode; lets the endless-only enemy kinds spawn. */
  endless = false;

  private elapsed = 0;
  private lastDeltaMs = 0;
  private lastEnemySpawn: number | null = null;
  private boss: Ship | null = null;
  private bossBar: Container | null = null;
  private bossBarFill: Graphics | null = null;

  private enemySprite!: Spritesheet;
  private readonly movementStates = new WeakMap<ObjectModelType, EnemyMovementState>();
  // separate from movementStates because those are reset when an enemy is recycled
  private readonly enemyKinds = new WeakMap<ObjectModelType, EnemyKind>();
  private glowTexture?: Texture;
  /** Called for every enemy that flew past the bottom edge, right before it re-enters at the top. */
  onEnemyPassed?: (enemy: ObjectModelType) => void;

  getKind(enemy: ObjectModelType): EnemyKind | undefined {
    return this.enemyKinds.get(enemy);
  }

  async init(): Promise<void> {
    this.enemySprite = await Assets.load<Spritesheet>('assets/game/enemies/enemy.json');
  }

  update(realTicker: Ticker, level: number): void {
    const ticker = this.object.getScaledTicker(realTicker);
    this.elapsed += ticker.deltaMS;
    this.lastDeltaMs = ticker.deltaMS;

    if (this.boss?.destroying || this.boss?.destroyed) {
      this.boss = null;
    }
    this.updateBossBar();

    const enemies = this.object.enemies();

    enemies
      .filter((enemy) => {
        if (enemy instanceof AnimatedGameSprite && enemy.orbitData !== undefined) {
          return enemy.orbitData.centerY > this.application.screen.height + OFF_SCREEN_BUFFER + enemy.orbitData.radius;
        }
        return enemy.y > this.application.screen.height + OFF_SCREEN_BUFFER;
      })
      .forEach((enemy) => {
        if (!(enemy as AnimatedGameSprite).isBoss) {
          this.onEnemyPassed?.(enemy);
        }
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
      check % Math.max(1, Math.round(getSpawnInterval(level) / this.spawnFactor)) === 0 &&
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
    const kind = this.pickEnemyKind();
    if (kind) {
      this.spawnKind(level, kind, animations);
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
    this.decorateForSeason(enemy);
    enemy.enableEnergyDisplay();
    this.object.add(enemy);
    this.application.stage.addChild(enemy);

    this.updateMovement(enemy, level, true);
  }

  private pickEnemyKind(): EnemyKind | undefined {
    let roll = Math.random();
    for (const kind of ENEMY_KINDS) {
      if (ENEMY_KIND_DEFINITIONS[kind].endlessOnly && !this.endless) {
        continue;
      }
      roll -= ENEMY_KIND_DEFINITIONS[kind].spawnChance;
      if (roll < 0) {
        return kind;
      }
    }
    return undefined;
  }

  /** Spawns one of the special enemy kinds, at the top of the screen. */
  spawnKind(level: number, kind: EnemyKind, animations: Record<string, Texture[]> = this.enemySprite.animations): Ship {
    const definition = ENEMY_KIND_DEFINITIONS[kind];
    // eslint-disable-next-line no-magic-numbers
    const enemy = new Ship(ShipType.enemy, this.shotService, this.explosionService, definition.speed + 0.02 * level, animations['frame']);
    enemy.autoFire = definition.autoFire;
    enemy.animationSpeed = ENEMY_ANIMATION_SPEED;
    enemy.play();
    enemy.anchor.set(THE_MIDDLE);
    enemy.scale.set(definition.scale);
    enemy.tint = definition.tint;
    enemy.xSpeed = KIND_XSPEED;
    const energy = (ENEMY_BASE_ENERGY + Math.floor((level - 1) / ENEMY_ENERGY_LEVEL_STEP)) * definition.energyMultiplier;
    enemy.maxEnergy = energy;
    enemy.energy = energy;
    const usableWidth = Math.max(0, this.application.screen.width - enemy.width - WEAVER_AMPLITUDE * DOUBLE);
    enemy.x = Math.floor(Math.random() * usableWidth) + enemy.width / DOUBLE + WEAVER_AMPLITUDE;
    enemy.y = 0;
    this.addGlow(enemy, definition.tint);
    this.decorateForSeason(enemy);
    enemy.enableEnergyDisplay();
    this.enemyKinds.set(enemy, kind);
    this.object.add(enemy);
    this.application.stage.addChild(enemy);
    return enemy;
  }

  /** Coloured halo behind the ship so the kinds are told apart at a glance. */
  private addGlow(enemy: Ship, color: number): void {
    const { width, height } = enemy.texture;
    // keep the hit box at the ship's frame although the glow is larger
    enemy.boundsArea = new Rectangle(-width * THE_MIDDLE, -height * THE_MIDDLE, width, height);
    this.glowTexture ??= createGlowTexture();
    const glow = new Sprite(this.glowTexture);
    glow.anchor.set(THE_MIDDLE);
    glow.width = Math.max(width, height) * ENEMY_GLOW_SIZE_FACTOR;
    glow.height = glow.width;
    glow.tint = color;
    glow.alpha = ENEMY_GLOW_ALPHA;
    glow.blendMode = 'add';
    enemy.addChildAt(glow, 0);
  }

  private updateKind(enemy: Ship, kind: EnemyKind, movement: EnemyMovementState): void {
    const screen = this.application.screen;
    switch (kind) {
      case EnemyKind.diver:
        if (!movement.diving && enemy.y >= screen.height * DIVER_TRIGGER_Y_RATIO) {
          movement.diving = true;
          enemy.targetX = this.getPlayer()?.x ?? enemy.x;
        }
        if (movement.diving) {
          enemy.y += DIVER_DIVE_SPEED * this.lastDeltaMs;
        }
        break;
      case EnemyKind.weaver:
        movement.weaveCenterX ??= enemy.x;
        movement.orbitAngle = (movement.orbitAngle ?? 0) + WEAVER_ANGULAR_SPEED * this.lastDeltaMs;
        enemy.targetX = undefined;
        enemy.x = movement.weaveCenterX + WEAVER_AMPLITUDE * Math.sin(movement.orbitAngle);
        break;
      case EnemyKind.bomber:
        if ((movement.nextAttack ??= this.elapsed + BOMBER_SHOT_INTERVAL_MS / DOUBLE) <= this.elapsed) {
          this.shotService.fireRadial(enemy, BOMBER_RING_COUNT, BOMBER_SHOT_SPEED);
          movement.nextAttack = this.elapsed + BOMBER_SHOT_INTERVAL_MS;
        }
        break;
      case EnemyKind.phantom:
        enemy.alpha = Math.min(1, enemy.alpha + this.lastDeltaMs / PHANTOM_FADE_IN_MS);
        if (enemy.y < screen.height * PHANTOM_MIN_Y_RATIO) {
          break;
        }
        if ((movement.nextAttack ??= this.elapsed + PHANTOM_BLINK_INTERVAL_MS) <= this.elapsed) {
          const margin = enemy.width / DOUBLE;
          enemy.targetX = undefined;
          enemy.x = margin + Math.random() * Math.max(0, screen.width - enemy.width);
          enemy.alpha = PHANTOM_BLINK_ALPHA;
          this.shotService.fireRadial(enemy, 1, PHANTOM_SHOT_SPEED, this.getAimAngle(enemy), 0);
          movement.nextAttack = this.elapsed + PHANTOM_BLINK_INTERVAL_MS;
        }
        break;
      default: {
        // sniper
        const holdY = screen.height * SNIPER_HOLD_Y_RATIO;
        if (enemy.y < holdY) {
          break;
        }
        movement.leaveAt ??= this.elapsed + SNIPER_HOLD_MS;
        if (this.elapsed >= movement.leaveAt) {
          break;
        }
        enemy.y = holdY;
        enemy.targetX = this.getPlayer()?.x ?? enemy.x;
        if ((movement.nextAttack ??= this.elapsed + SNIPER_SHOT_INTERVAL_MS / DOUBLE) <= this.elapsed) {
          this.shotService.fireRadial(enemy, 1, SNIPER_SHOT_SPEED, this.getAimAngle(enemy), 0);
          movement.nextAttack = this.elapsed + SNIPER_SHOT_INTERVAL_MS;
        }
        break;
      }
    }
  }

  private decorateForSeason(enemy: Ship): void {
    if (!CURRENT_SEASON_EVENT) {
      return;
    }
    const { enemyIcons } = CURRENT_SEASON_EVENT;
    const { width, height } = enemy.texture;
    // keep the hit box at the ship's frame although the icon is drawn larger
    enemy.boundsArea = new Rectangle(-width * THE_MIDDLE, -height * THE_MIDDLE, width, height);
    const icon = new Text({
      text: enemyIcons[Math.floor(Math.random() * enemyIcons.length)],
      // eslint-disable-next-line no-magic-numbers
      style: { fontSize: Math.round(height * 1.4) },
    });
    icon.anchor.set(THE_MIDDLE);
    enemy.addChild(icon);
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
    if (enemy instanceof Ship && enemy.isBoss) {
      this.updateBoss(enemy);
      return;
    }

    // Orbiters self-navigate via orbitData - no additional movement logic needed
    if (enemy instanceof AnimatedGameSprite && enemy.orbitData !== undefined) {
      return;
    }

    const screenWidth = this.application.screen.width;
    const movement = this.getMovementState(enemy);
    const kind = this.enemyKinds.get(enemy);
    if (kind && enemy instanceof Ship) {
      this.updateKind(enemy, kind, movement);
      return;
    }

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
    const bossEnergy = BOSS_ENERGY_BASE + BOSS_ENERGY_LEVEL_STEP * (getDifficultyLevel(stage) - 1);
    const pattern = getBossPattern(stage);
    const definition = BOSS_DEFINITIONS[pattern];

    const boss = new Ship(
      ShipType.enemy,
      this.shotService,
      this.explosionService,
      BOSS_SPEED,
      animations['frame'],
    );
    boss.isBoss = true;
    boss.autoFire = definition.autoFire;
    boss.animationSpeed = ENEMY_ANIMATION_SPEED;
    boss.play();
    boss.anchor.set(THE_MIDDLE);
    boss.scale.set(BOSS_SCALE);
    boss.maxEnergy = bossEnergy;
    boss.energy = bossEnergy;
    boss.shotSpeed = BOSS_SHOT_SPEED;
    boss.shotPower = BOSS_SHOT_POWER;
    boss.xSpeed = definition.xSpeed;
    boss.explosionCount = BOSS_EXPLOSION_COUNT;
    boss.explosionScale = BOSS_EXPLOSION_SCALE;
    boss.tint = definition.tint;
    boss.x = this.application.screen.width / BOSS_SCREEN_CENTER_DIVIDER;
    boss.y = 0;
    this.object.add(boss);
    this.application.stage.addChild(boss);
    this.boss = boss;
    this.createBossBar(definition.tint);

    const movement = this.getMovementState(boss);
    movement.bossPattern = pattern;
    movement.nextAttack = this.elapsed + definition.attackIntervalMs;
    this.updateBoss(boss);
  }

  private createBossBar(color: number): void {
    this.bossBar?.destroy({ children: true });
    const width = this.application.screen.width * BOSS_BAR_WIDTH_RATIO;
    this.bossBar = new Container();
    this.bossBar.addChild(
      new Graphics()
        .rect(-BOSS_BAR_BORDER, -BOSS_BAR_BORDER, width + BOSS_BAR_BORDER * DOUBLE, BOSS_BAR_HEIGHT + BOSS_BAR_BORDER * DOUBLE)
        .fill(BOSS_BAR_BORDER_COLOR)
        .rect(0, 0, width, BOSS_BAR_HEIGHT)
        .fill(BOSS_BAR_BACKGROUND),
    );
    this.bossBarFill = new Graphics().rect(0, 0, width, BOSS_BAR_HEIGHT).fill(color);
    this.bossBar.addChild(this.bossBarFill);
    this.bossBar.x = (this.application.screen.width - width) / DOUBLE;
    this.bossBar.y = BOSS_BAR_Y;
    this.application.stage.addChild(this.bossBar);
  }

  private updateBossBar(): void {
    if (!this.bossBar) {
      return;
    }
    if (!this.boss) {
      this.bossBar.destroy({ children: true });
      this.bossBar = null;
      this.bossBarFill = null;
      return;
    }
    this.bossBarFill!.scale.x = Math.max(0, this.boss.energy / this.boss.maxEnergy);
  }

  private updateBoss(boss: Ship): void {
    const movement = this.getMovementState(boss);
    const pattern = movement.bossPattern ?? BossPattern.sweeper;
    const hoverY = Math.max(BOSS_HOVER_Y_MIN, this.application.screen.height * BOSS_HOVER_Y_RATIO);
    movement.bossArrived ||= boss.y >= hoverY;
    const arrived = movement.bossArrived;
    // bosses fly in from the top and then hold their altitude (the orbiter places itself)
    if (!arrived || pattern !== BossPattern.orbiter) {
      boss.y = Math.min(boss.y, hoverY);
    }

    if (pattern === BossPattern.orbiter && arrived) {
      this.updateOrbitMovement(boss, movement, hoverY);
    } else if (pattern === BossPattern.hunter) {
      boss.targetX = this.getPlayer()?.x ?? boss.x;
    } else if (pattern === BossPattern.warper) {
      // stays put between its jumps
      boss.targetX = undefined;
    } else {
      this.updateSweepMovement(boss, movement);
    }

    if (arrived && movement.nextAttack !== undefined && movement.nextAttack <= this.elapsed) {
      this.fireBossAttack(boss, pattern, movement);
      const enraged = boss.energy <= boss.maxEnergy * BOSS_ENRAGE_RATIO;
      const interval = BOSS_DEFINITIONS[pattern].attackIntervalMs;
      movement.nextAttack = this.elapsed + (enraged ? interval * BOSS_ENRAGE_INTERVAL_FACTOR : interval);
    }
  }

  private fireBossAttack(boss: Ship, pattern: BossPattern, movement: EnemyMovementState): void {
    switch (pattern) {
      case BossPattern.spiral:
        // two arms that keep turning, so the shots form a spiral
        movement.spiralAngle = (movement.spiralAngle ?? DOWN) + BOSS_SPIRAL_STEP;
        this.shotService.fireRadial(boss, BOSS_SPIRAL_ARMS, BOSS_RADIAL_SHOT_SPEED, movement.spiralAngle);
        break;
      case BossPattern.warper: {
        // jumps to a new spot, then fires a wide aimed volley
        const margin = boss.width / DOUBLE + BOSS_SWEEP_MARGIN;
        boss.x = margin + Math.random() * Math.max(0, this.application.screen.width - margin * DOUBLE);
        this.shotService.fireRadial(boss, BOSS_WARP_COUNT, BOSS_RADIAL_SHOT_SPEED, this.getAimAngle(boss) - BOSS_WARP_ARC / DOUBLE, BOSS_WARP_ARC);
        break;
      }
      case BossPattern.orbiter:
        // full ring in all directions
        this.shotService.fireRadial(boss, BOSS_RING_COUNT, BOSS_RADIAL_SHOT_SPEED);
        break;
      case BossPattern.hunter: {
        // tight volley aimed at the player
        this.shotService.fireRadial(boss, BOSS_AIMED_COUNT, BOSS_RADIAL_SHOT_SPEED, this.getAimAngle(boss) - BOSS_AIMED_ARC / DOUBLE, BOSS_AIMED_ARC);
        break;
      }
      default:
        // sweeper: fan of shots spreading downwards
        this.shotService.fireRadial(boss, BOSS_FAN_COUNT, BOSS_RADIAL_SHOT_SPEED, DOWN - BOSS_FAN_ARC / DOUBLE, BOSS_FAN_ARC);
    }
  }

  /** Lying figure eight around the top centre of the screen. */
  private updateOrbitMovement(boss: Ship, movement: EnemyMovementState, hoverY: number): void {
    movement.orbitAngle = (movement.orbitAngle ?? 0) + BOSS_ORBIT_ANGULAR_SPEED * this.lastDeltaMs;
    const angle = movement.orbitAngle;
    const centerX = this.application.screen.width / DOUBLE;
    const radiusX = this.application.screen.width * BOSS_ORBIT_RADIUS_X_RATIO;
    boss.targetX = undefined;
    boss.x = centerX + radiusX * Math.sin(angle);
    // starts and stays at hoverY on average, dips below and above it
    boss.y = hoverY + BOSS_ORBIT_RADIUS_Y * Math.sin(angle * DOUBLE);
  }

  /** Angle from the shooter to the player, straight down if there is none. */
  private getAimAngle(shooter: Ship): number {
    const player = this.getPlayer();
    return player ? Math.atan2(player.y - shooter.y, player.x - shooter.x) : DOWN;
  }

  private getPlayer(): ObjectModelType | undefined {
    return this.object.objects().find((object) => object.type === ObjectType.ship);
  }

  private updateSweepMovement(boss: Ship, movement: EnemyMovementState): void {
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
