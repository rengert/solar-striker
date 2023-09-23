import { Application, Assets, Spritesheet, Texture } from 'pixi.js';
import { GameSprite } from '../models/pixijs/game-sprite';
import { Ship } from '../models/pixijs/ship';

export class PixiGameShipService {
  autoFire = false;

  #shots: GameSprite[] = [];
  #ship?: Ship;

  private elapsed = 0;
  private lastShot = 0;

  private laserAnimation!: Texture[];
  private shipAnimation!: Texture[];

  constructor(private readonly app: Application) {
  }

  async init(): Promise<void> {
    const ship = await Assets.load<Spritesheet>('assets/game/ship/ship_blue.json');
    this.shipAnimation = ship.animations['ship'];

    const laser = await Assets.load<Spritesheet>('assets/game/laser.json');
    this.laserAnimation = laser.animations['laser'];
  }

  get instance(): Ship {
    if (!this.#ship) {
      throw new Error('Where is my ship?');
    }
    return this.#ship;
  }

  get shots(): GameSprite[] {
    return [...this.#shots];
  }

  spawn(): void {
    this.#ship = new Ship(0, this.shipAnimation);
    this.#ship.animationSpeed = 0.167;
    this.#ship.play();
    this.#ship.x = Math.floor(this.app.screen.width / 2);
    this.#ship.y = this.app.screen.height - 100;
    this.app.stage.addChild(this.#ship);
  }

  shot(): void {
    if (!this.#ship || this.#ship.destroyed) {
      return;
    }

    const power = Math.min(this.instance.shotPower, 3);
    for (let i = 1; i <= power; i++) {
      const shot = new GameSprite(-this.#ship.shotSpeed, this.laserAnimation);
      shot.animationSpeed = 0.167;
      shot.play();
      shot.anchor.set(0.5);
      if ((power === 1) || (power === 3 && i === 2)) {
        shot.x = this.#ship.x;
        shot.y = this.#ship.y - 45;
      } else if (power > 1 && i === 1) {
        shot.x = this.#ship.x - 5;
        shot.y = this.#ship.y - 25;
      } else {
        shot.x = this.#ship.x + 5;
        shot.y = this.#ship.y - 25;
      }

      this.#shots.push(shot);
      this.app.stage.addChild(shot);
    }
  }

  update(delta: number): void {
    this.elapsed += delta;

    const check = Math.floor(this.elapsed);
    // todo: check if we want two power ups for speed
    if (this.autoFire && (check % Math.floor(60 / this.instance.shotSpeed) === 0) && (check !== this.lastShot)) {
      this.lastShot = check;
      this.shot();
    }

    this.#shots.filter(shot => !shot.destroyed && shot.y < 0).forEach(shot => shot.destroy());
    this.#shots = this.#shots.filter(shot => !shot.destroyed);
  }
}
