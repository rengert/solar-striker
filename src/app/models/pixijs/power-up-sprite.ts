import { FrameObject, Texture } from 'pixi.js';
import { PowerUpConfig } from '../power-up-config.model';
import { AnimatedGameSprite } from './animated-game-sprite';

export enum PowerUp {
  speed,
  shotSpeed,
  shotPower,
}

export class PowerUpSprite extends AnimatedGameSprite {
  readonly config: PowerUpConfig;

  constructor(speed: number, textures: Texture[] | FrameObject[], config: PowerUpConfig) {
    super(speed, textures);

    this.config = config;
  }
}
