import { Application } from 'pixi.js';
import { GameSprite } from '../models/pixijs/game-sprite';
import { GAME_CONFIG } from './pixi-game-constants';

export class PixiGameShipService {
  autoFire: boolean = false;
  #ship?: GameSprite;
  #shots: GameSprite[] = [];
  private elapsed = 0;
  private lastShot = 0;

  constructor(private readonly app: Application) {
    app.loader.add('assets/laser.json').add('assets/ship.json');
  }

  get instance(): GameSprite {
    // to do needs to be optional?
    return this.#ship !;
  }

  get shots(): GameSprite[] {
    return [...this.#shots];
  }

  spawn(): void {
    const ship = this.app.loader.resources['assets/ship.json'].spritesheet !;
    this.#ship = new GameSprite(0, ship.animations['ship']);
    this.#ship.animationSpeed = 0.167;
    this.#ship.play();
    this.#ship.x = Math.floor(this.app.screen.width / 2);
    this.#ship.y = this.app.screen.height - 80;
    this.app.stage.addChild(this.#ship);
  }

  shot(): void {
    if (!this.#ship || this.#ship.destroyed) {
      return;
    }

    const laser = this.app.loader.resources['assets/laser.json'].spritesheet !;
    const shot = new GameSprite(-3, laser.animations['laser']);
    shot.animationSpeed = 0.167;
    shot.play();
    shot.anchor.set(0.5);
    shot.x = this.#ship.x;
    shot.y = this.#ship.y;
    this.#shots.push(shot);
    this.app.stage.addChild(shot);
  }

  update(delta: number) {
    this.elapsed += delta;

    const check = Math.floor(this.elapsed);
    if (this.autoFire && (check % (60 / GAME_CONFIG.ship.autoFireSpeed) === 0) && (check !== this.lastShot)) {
      this.lastShot = check;
      this.shot();
    }

    this.#shots.filter(shot => !shot.destroyed && shot.y < 0).forEach(shot => shot.destroy());
    this.#shots = this.#shots.filter(shot => !shot.destroyed);
  }
}
