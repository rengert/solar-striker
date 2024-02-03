import { FrameObject, Texture } from 'pixi.js';
import { PowerUpConfig } from '../power-up-config.model';
import { AnimatedGameSprite } from './animated-game-sprite';
import { ObjectType } from './object-type.enum';

export enum PowerUp {
  speed,
  shotSpeed,
  shotPower,
}

export class PowerUpSprite extends AnimatedGameSprite {
  readonly config: PowerUpConfig;

  constructor(speed: number, textures: Texture[] | FrameObject[], config: PowerUpConfig) {
    super(ObjectType.collectable, null, speed, textures);

    this.config = config;
    this.energy = 1;
  }

  override explode(): void {
    this.destroying = true;
  }
}
