import { FrameObject, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../../game-constants';
import { ExplosionService } from '../../services/explosion.service';
import { GameShotService } from '../../services/game-shot.service';
import { AnimatedGameSprite } from './animated-game-sprite';
import { ObjectType } from './object-type.enum';
import { ShipType } from './ship-type.enum';

export class Ship extends AnimatedGameSprite {
  shotPower = 1;
  shotSpeed = 1;
  lastShot = 0;
  autoFire = false;


  private elapsed = 0;

  // eslint-disable-next-line max-params
  constructor(
    readonly shipType: ShipType,
    private readonly shotService: GameShotService,
    explosion: ExplosionService,
    speed: number,
    textures: Texture[] | FrameObject[]) {
    super(shipType as unknown as ObjectType, explosion, speed, textures);

    this.energy = GAME_CONFIG.ships[this.shipType].energy;
    this.shotSpeed = GAME_CONFIG.ships[this.shipType].shotSpeed;
  }

  override set energy(value: number) {
    super.energy = Math.min(value, GAME_CONFIG.ships[this.shipType].energy);
  };

  override get energy(): number {
    return super.energy ?? 0;
  }

  shot(): void {
    this.shotService.shot(this.shotPower, this, this.speed <= 0);
  }

  override update(delta: number): void {
    super.update(delta);

    this.elapsed += delta;

    const check = Math.floor(this.elapsed);
    // todo: check if we want two power ups for speed
    if (this.autoFire && (check % Math.floor(60 / this.shotSpeed) === 0) && (check !== this.lastShot)) {
      this.lastShot = check;
      this.shot();
    }
  }
}
