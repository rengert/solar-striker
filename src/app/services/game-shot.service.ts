import { Injectable } from '@angular/core';
import { Assets, Spritesheet, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { Rocket } from '../models/pixijs/rocket';
import { Ship } from '../models/pixijs/ship';
import { ApplicationService } from './application.service';

@Injectable()
export class GameShotService {
  #shots: Rocket[] = [];

  private laserAnimation: Texture[] | undefined;

  constructor(private readonly application: ApplicationService) {
  }

  get shots(): Rocket[] {
    return [...this.#shots];
  }

  async init(): Promise<void> {
    if (!this.laserAnimation) {
      const laser = await Assets.load<Spritesheet>('assets/game/laser.json');
      const laserAnimations: Record<string, Texture[]> = laser.animations;
      this.laserAnimation = laserAnimations['laser'];
    }
  }

  shot(power: number, ship: Ship, up: boolean): void {
    const { x, y } = ship;
    for (let i = 1; i <= power; i++) {
      const shot = new Rocket(up ? -GAME_CONFIG.ships[ship.type].shotSpeed : GAME_CONFIG.ships[ship.type].shotSpeed, this.laserAnimation !);
      shot.reference = ship;
      shot.animationSpeed = 0.167;
      shot.play();
      shot.rotation = up ? 0 : Math.PI;
      shot.anchor.set(0.5);
      if ((power === 1) || (power === 3 && i === 2)) {
        shot.x = x;
        shot.y = y - 22;
      } else if (power > 1 && i === 1) {
        shot.x = x - 22;
        shot.y = y - 6;
      } else {
        shot.x = x + 22;
        shot.y = y - 6;
      }

      this.#shots.push(shot);
      this.application.stage.addChild(shot);
    }
  }

  update(): void {
    this.#shots.filter(shot => !shot.destroyed && shot.y < 0).forEach(shot => shot.destroy());
    this.#shots = this.#shots.filter(shot => !shot.destroyed);
  }
}
