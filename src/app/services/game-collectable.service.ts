import { inject, Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { PowerUpSprite } from '../models/pixijs/power-up-sprite';
import { Ship } from '../models/pixijs/ship';
import { ObjectModelType, ObjectService } from './object.service';
import { UpdatableService } from './updatable.service';

interface Dictionary<T> {
  [key: string]: T;
}

function collectPowerUp(object: ObjectModelType, by: ObjectModelType): void {
  if (by.type !== ObjectType.ship) {
    return;
  }
  const ship = by as unknown as Ship;
  const powerUp = object as unknown as PowerUpSprite;
  ship.shotSpeed += powerUp.config.powerUp.speed;
  ship.shotPower += powerUp.config.powerUp.shot;
  ship.energy += powerUp.config.powerUp.energy;
}

@Injectable()
export class GameCollectableService extends UpdatableService {
  private readonly object = inject(ObjectService);

  private readonly animations: Dictionary<Texture[]> = {};

  constructor() {
    super();

    this.object.onDestroyed(ObjectType.enemy, (enemy, by) => this.spawn(enemy, by));
    this.object.onDestroyed(ObjectType.collectable, (powerUp, by) => collectPowerUp(powerUp, by));
  }

  async init(): Promise<void> {
    if (Object.values(this.animations).length === 0) {
      for (const config of GAME_CONFIG.powerUpConfig) {
        const powerUp = await Assets.load<Spritesheet>(config.assetUrl);
        const animations: Record<string, Texture[]> = powerUp.animations;
        this.animations[config.type] = animations[config.animationName];
      }
    }
  }

  update(): void {
    //
  }

  private spawn({ x, y }: ObjectModelType, { type, reference }: ObjectModelType): void {
    if (type !== ObjectType.ship && reference?.type !== ObjectType.ship) {
      return;
    }

    const rand = Math.random();
    if (rand > GAME_CONFIG.collectableFactor) {
      return;
    }

    const value = Math.floor(Math.random() * GAME_CONFIG.powerUpConfig.length);
    const powerUpType = GAME_CONFIG.powerUpConfig[value];
    const texture = this.animations[powerUpType.type];
    const powerUp = new PowerUpSprite(1, texture, powerUpType);
    powerUp.animationSpeed = 0.167;
    powerUp.play();
    // eslint-disable-next-line no-magic-numbers
    powerUp.anchor.set(0.5);
    powerUp.x = x;
    powerUp.y = y;
    powerUp.power = 0;
    this.application.stage.addChild(powerUp);
    this.object.add(powerUp);
  }
}
