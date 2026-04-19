import { FrameObject, Texture, Ticker } from 'pixi.js';
import { GAME_CONFIG } from '../../game-constants';
import { ExplosionService } from '../../services/explosion.service';
import { GameShotService } from '../../services/game-shot.service';
import { AnimatedGameSprite } from './animated-game-sprite';
import { ObjectType } from './object-type.enum';
import { ShipType } from './ship-type.enum';

const SHIELD_TINT = 0x00ccff;
const NO_TINT = 0xffffff;
const SHIELD_PULSE_SPEED = 0.005;
const COLOR_CHANNEL_MASK = 0xff;

export class Ship extends AnimatedGameSprite {
  shotPower = 1;
  shotSpeed: number;
  rocketSpeed: number;
  lastShot = 0;
  autoFire = false;
  maxEnergy: number;
  shieldTicks = 0;

  /** Base stat used by ShipUpgradeService to add upgrade bonuses idempotently. */
  baseMaxEnergy: number;
  /** Base stat used by ShipUpgradeService to add upgrade bonuses idempotently. */
  baseShotSpeed: number;
  /** Base stat used by ShipUpgradeService to add upgrade bonuses idempotently. */
  baseShotPower: number;

  private elapsed = 0;
  private rotationTarget = 0;

  // eslint-disable-next-line max-params
  constructor(
    readonly shipType: ShipType,
    private readonly shotService: GameShotService,
    explosion: ExplosionService,
    speed: number,
    textures: Texture[] | FrameObject[],
  ) {
    super(shipType as unknown as ObjectType, explosion, speed, textures);

    this.maxEnergy = GAME_CONFIG.ships[this.shipType].energy;
    this.baseMaxEnergy = this.maxEnergy;
    this.energy = this.maxEnergy;
    this.shotSpeed = GAME_CONFIG.ships[this.shipType].shotSpeed;
    this.baseShotSpeed = this.shotSpeed;
    this.shotPower = 1;
    this.baseShotPower = 1;
    this.rocketSpeed = GAME_CONFIG.ships[this.shipType].rocketSpeed;
  }

  override get isShielded(): boolean {
    return this.shieldTicks > 0;
  }

  override get energy(): number {
    return super.energy ?? 0;
  }

  override set energy(value: number) {
    super.energy = Math.min(value, this.maxEnergy);
  }

  shot(): void {
    this.shotService.shot(this.shotPower, this, this.speed <= 0);
  }

  override update(ticker: Ticker): void {
    const previousX = this.x;
    const previousY = this.y;

    super.update(ticker);

    this.elapsed += Math.floor(ticker.deltaMS);
    const check = Math.floor(this.elapsed);
    // todo: check if we want two power ups for speed
    // eslint-disable-next-line no-magic-numbers
    if (this.autoFire && check - this.lastShot > 1000 / this.shotSpeed && check !== this.lastShot) {
      this.lastShot = check;
      this.shot();
    }

    if (this.shieldTicks > 0) {
      this.shieldTicks = Math.max(0, this.shieldTicks - ticker.deltaMS);
      // eslint-disable-next-line no-magic-numbers
      const pulse = (Math.sin(this.elapsed * SHIELD_PULSE_SPEED) + 1) / 2;
      // eslint-disable-next-line no-magic-numbers
      const shieldG = (SHIELD_TINT >> 8) & COLOR_CHANNEL_MASK;
      // eslint-disable-next-line no-magic-numbers
      const whiteR = (NO_TINT >> 16) & COLOR_CHANNEL_MASK;
      // eslint-disable-next-line no-magic-numbers
      const whiteG = (NO_TINT >> 8) & COLOR_CHANNEL_MASK;
      const whiteB = NO_TINT & COLOR_CHANNEL_MASK;
      const r = Math.round(pulse * whiteR);
      const g = Math.round(shieldG + pulse * (whiteG - shieldG));
      const b = whiteB;
      // eslint-disable-next-line no-magic-numbers
      this.tint = (r << 16) | (g << 8) | b;
    } else {
      this.tint = NO_TINT;
    }

    const deltaX = this.x - previousX;
    const deltaY = this.y - previousY;

    if (this.shipType === ShipType.enemy) {
      if (deltaX === 0 && deltaY === 0) {
        this.rotationTarget = 0;
      } else {
        const angle = Math.atan2(deltaX, deltaY);
        // eslint-disable-next-line no-magic-numbers
        const maxTilt = this.loopData ? Math.PI : Math.PI / 5;
        const clampedAngle = Math.min(Math.max(angle, -maxTilt), maxTilt);
        this.rotationTarget = -clampedAngle;
      }
      // eslint-disable-next-line no-magic-numbers
      const smoothing = this.loopData ? 0.1 : 0.025;
      this.rotation += (this.rotationTarget - this.rotation) * smoothing;
    } else {
      // eslint-disable-next-line no-magic-numbers
      if (Math.abs(deltaX) < 0.01) {
        this.rotationTarget = 0;
      } else {
        // eslint-disable-next-line no-magic-numbers
        const maxTilt = Math.PI / 8;
        // eslint-disable-next-line no-magic-numbers
        const normalizedMovement = Math.min(Math.max(deltaX / 5, -1), 1);
        this.rotationTarget = normalizedMovement * maxTilt;
      }
      // eslint-disable-next-line no-magic-numbers
      const smoothing = 0.1;
      this.rotation += (this.rotationTarget - this.rotation) * smoothing;
    }
  }
}
