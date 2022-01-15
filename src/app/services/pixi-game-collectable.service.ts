import { Injectable } from '@angular/core';
import { Application } from 'pixi.js';
import { GameSprite } from '../models/pixijs/game-sprite';
import { PowerUp, PowerUpSprite } from '../models/pixijs/power-up-sprite';

export class PixiGameCollectableService {
  private collectables: PowerUpSprite[] = [];

  constructor(private readonly app: Application) {
    this.app.loader.add('assets/power-up-1.json')
      .add('assets/power-up-2.json');
  }

  spawn(x: number, y: number): void {
    const rand = Math.random();
    if (rand > 0.1) {
      return;
    }
    const type = Math.random() > 0.5 ? PowerUp.Speed : PowerUp.Shot;
    const powerUp = new PowerUpSprite(
      1,
      type === PowerUp.Speed
        ? this.app.loader.resources['assets/power-up-1.json'].spritesheet !.animations['power-up-1']
        : this.app.loader.resources['assets/power-up-2.json'].spritesheet !.animations['power-up-2'],
      type,
    );
    powerUp.animationSpeed = 0.167;
    powerUp.play();
    powerUp.anchor.set(0.5);
    powerUp.x = x;
    powerUp.y = y;
    this.app.stage.addChild(powerUp);
    this.collectables.push(powerUp);
  }

  collect(player: GameSprite): void {
    if (!player || player.destroyed) {
      return;
    }

    const powerUp = this.collectables.find(collectable => !collectable.destroyed && player.hit(collectable));
    if (powerUp) {
      if (powerUp.type === PowerUp.Speed) {
        // this.shotSpeed++;
      }
      if (powerUp.type === PowerUp.Shot) {
        // this.shotPower++;
      }
      powerUp.destroy();
      this.collectables = this.collectables.filter(collectable => !collectable.destroyed);
    }
  }
}
