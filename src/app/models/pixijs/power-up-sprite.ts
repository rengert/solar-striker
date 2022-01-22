import { FrameObject, Texture } from 'pixi.js';
import { GameSprite } from './game-sprite';

export enum PowerUp {
  Speed,
  Shot,
}

export class PowerUpSprite extends GameSprite {
  readonly type: PowerUp = PowerUp.Speed;

  constructor(speed: number, textures: Texture[] | FrameObject[], type: PowerUp) {
    super(speed, textures);

    this.type = type;
  }
}
