import { inject, Injectable } from '@angular/core';
import { Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG, OFF_SCREEN_BUFFER } from '../game-constants';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { GameSprite } from '../models/pixijs/simple-game-sprite';
import { ExplosionService } from './explosion.service';
import { ObjectModelType, ObjectService } from './object.service';
import { UpdatableService } from './updatable.service';

const METEOR_BASE_SPEED = 0.24;
const METEOR_SPEED_STEP = 0.05;
const METEOR_BASE_ENERGY = 10;
const METEOR_ENERGY_STEP = 2;

// Meteors wider than this threshold split into fragments instead of being destroyed
const METEOR_SPLIT_MIN_WIDTH = 36;
const METEOR_MIN_FRAGMENTS = 2;
const METEOR_MAX_FRAGMENTS = 4;
// eslint-disable-next-line no-magic-numbers
const METEOR_FRAGMENT_SCATTER = 15;
const METEOR_FRAGMENT_SIZE_DIVISOR = 2;

@Injectable()
export class GameMeteorService extends UpdatableService {
  private readonly explosionService = inject(ExplosionService);
  private readonly object = inject(ObjectService);

  /** Meteors that split into fragments — used by GameService to skip direct coin rewards. */
  readonly splitMeteors = new WeakSet<ObjectModelType>();

  private readonly meteorInitialWidths = new WeakMap<ObjectModelType, number>();
  private currentLevel = 1;
  private elapsed = 0;
  // eslint-disable-next-line no-magic-numbers
  private lastMeteorSpawn = -1;

  constructor() {
    super();
    this.object.onDestroyed(ObjectType.meteor, (meteor) => {
      this.onMeteorDestroyed(meteor);
    });
  }

  update(ticker: Ticker, level: number): void {
    this.currentLevel = level;
    this.elapsed += ticker.deltaMS;

    this.object
      .meteors()
      .filter((meteor) => meteor.y > this.application.screen.height + OFF_SCREEN_BUFFER)
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

  private onMeteorDestroyed(meteor: ObjectModelType): void {
    const initialWidth = this.meteorInitialWidths.get(meteor);
    if (initialWidth === undefined || initialWidth <= METEOR_SPLIT_MIN_WIDTH) {
      return;
    }

    this.splitMeteors.add(meteor);

    const fragmentCount =
      METEOR_MIN_FRAGMENTS +
      Math.floor(Math.random() * (METEOR_MAX_FRAGMENTS - METEOR_MIN_FRAGMENTS + 1));
    const originalEnergy = meteor.initialEnergy ?? 1;
    const fragmentEnergy = Math.max(1, Math.ceil(originalEnergy / fragmentCount));
    const fragmentWidth = initialWidth / METEOR_FRAGMENT_SIZE_DIVISOR;

    for (let i = 0; i < fragmentCount; i++) {
      // eslint-disable-next-line no-magic-numbers
      const offsetX = (Math.random() - 0.5) * 2 * METEOR_FRAGMENT_SCATTER;
      // eslint-disable-next-line no-magic-numbers
      const offsetY = (Math.random() - 0.5) * 2 * METEOR_FRAGMENT_SCATTER;
      this.spawnFragment(meteor.x + offsetX, meteor.y + offsetY, fragmentEnergy, fragmentWidth);
    }
  }

  private spawnFragment(x: number, y: number, energy: number, size: number): void {
    // eslint-disable-next-line no-magic-numbers
    const index = Math.floor(Math.random() * 4) + 1;
    const fragment = new GameSprite(ObjectType.meteor, this.explosionService, {
      speed: METEOR_BASE_SPEED + METEOR_SPEED_STEP * Math.max(0, this.currentLevel - 1),
      texture: Texture.from(`meteor${index}`),
      hasEnergy: true,
    });
    // eslint-disable-next-line no-magic-numbers
    fragment.anchor.set(0.5);
    fragment.x = x;
    fragment.y = y;
    fragment.width = size;
    fragment.height = size;
    fragment.energy = energy;
    this.meteorInitialWidths.set(fragment, size);
    this.object.add(fragment);
    this.application.stage.addChild(fragment);
  }

  private spawn(level: number): void {
    // eslint-disable-next-line no-magic-numbers
    const position = Math.floor(Math.random() * this.application.screen.width - 20) + 10;
    // eslint-disable-next-line no-magic-numbers
    const index = Math.floor(Math.random() * 4) + 1;
    const meteor = new GameSprite(ObjectType.meteor, this.explosionService, {
      speed: METEOR_BASE_SPEED + METEOR_SPEED_STEP * Math.max(0, level - 1),
      texture: Texture.from(`meteor${index}`),
      hasEnergy: true,
    });
    // eslint-disable-next-line no-magic-numbers
    meteor.anchor.set(0.5);
    meteor.x = position;
    meteor.y = 10;
    // eslint-disable-next-line no-magic-numbers
    meteor.width += Math.random() * 20;
    // eslint-disable-next-line no-magic-numbers
    meteor.height += Math.random() * 20;
    meteor.energy = METEOR_BASE_ENERGY + METEOR_ENERGY_STEP * Math.max(0, level - 1);
    this.meteorInitialWidths.set(meteor, meteor.width);
    this.object.add(meteor);
    this.application.stage.addChild(meteor);
  }
}
