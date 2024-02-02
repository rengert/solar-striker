import { FrameObject, Texture } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { AnimatedGameSprite } from './animated-game-sprite';
import { ObjectType } from './object-type.enum';

export class Rocket extends AnimatedGameSprite {
  constructor(
    explosion: ExplosionService,
    speed: number,
    textures: Texture[] | FrameObject[],
    autoUpdate?: boolean) {
    super(ObjectType.rocket, explosion, speed, textures, autoUpdate);

    this.energy = 1;
  }
}
