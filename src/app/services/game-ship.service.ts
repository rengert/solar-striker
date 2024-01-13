import { Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { Ship } from '../models/pixijs/ship';
import { ApplicationService } from './application.service';

@Injectable()
export class GameShipService {
  autoFire = false;

  #shots: AnimatedGameSprite[] = [];
  #ship?: Ship;

  private elapsed = 0;
  private lastShot = 0;

  private laserAnimation: Texture[] | undefined;
  private shipAnimation: Texture[] | undefined;

  constructor(private readonly application: ApplicationService) {
  }

  async init(): Promise<void> {
    if (!this.shipAnimation) {
      const ship = await Assets.load<Spritesheet>('assets/game/ship/ship_blue.json');
      const animations: Record<string, Texture[]> = ship.animations;
      this.shipAnimation = animations['ship'];
    }

    if (!this.laserAnimation) {
      const laser = await Assets.load<Spritesheet>('assets/game/laser.json');
      const laserAnimations: Record<string, Texture[]> = laser.animations;
      this.laserAnimation = laserAnimations['laser'];
    }
  }

  get instance(): Ship {
    if (!this.#ship) {
      throw new Error('Where is my ship?');
    }
    return this.#ship;
  }

  get shots(): AnimatedGameSprite[] {
    return [...this.#shots];
  }

  spawn(): void {
    this.#ship = new Ship(0, this.shipAnimation !);
    this.#ship.animationSpeed = 0.167;
    this.#ship._width = 20;
    this.#ship._height = 20;
    this.#ship.play();
    this.#ship.x = Math.floor(this.application.screen.width / 2);
    this.#ship.y = this.application.screen.height - 100;
    this.application.stage.addChild(this.#ship);
  }

  shot(): void {
    if (!this.#ship || this.#ship.destroyed) {
      return;
    }

    const power = Math.min(this.instance.shotPower, 3);
    for (let i = 1; i <= power; i++) {
      const shot = new AnimatedGameSprite(-GAME_CONFIG.ship.shotSpeed, this.laserAnimation !);
      shot.animationSpeed = 0.167;
      shot.play();
      shot.anchor.set(0.5);
      if ((power === 1) || (power === 3 && i === 2)) {
        shot.x = this.#ship.x;
        shot.y = this.#ship.y - 22;
      } else if (power > 1 && i === 1) {
        shot.x = this.#ship.x - 22;
        shot.y = this.#ship.y - 6;
      } else {
        shot.x = this.#ship.x + 22;
        shot.y = this.#ship.y - 6;
      }

      this.#shots.push(shot);
      this.application.stage.addChild(shot);
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
