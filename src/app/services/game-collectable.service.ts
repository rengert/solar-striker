import { Application, Assets, Spritesheet, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { PowerUpSprite } from '../models/pixijs/power-up-sprite';
import { Ship } from '../models/pixijs/ship';

interface Dictionary<T> {
  [key: string]: T;
}

export class GameCollectableService {
  private collectables: PowerUpSprite[] = [];
  private readonly animations: Dictionary<Texture[]> = {};

  constructor(private readonly app: Application) {
  }

  async init(): Promise<void> {
    for (const config of GAME_CONFIG.powerUpConfig) {
      const powerUp = await Assets.load<Spritesheet>(config.assetUrl);
      const animations: Record<string, Texture[]> = powerUp.animations;
      this.animations[config.type] = animations[config.animationName];
    }
  }

  spawn(x: number, y: number): void {
    const rand = Math.random();
    if (rand > 0.2) {
      return;
    }
    const value = Math.floor(Math.random() * GAME_CONFIG.powerUpConfig.length);
    const type = GAME_CONFIG.powerUpConfig[value];
    const texture = this.animations[type.type];
    const powerUp = new PowerUpSprite(1, texture, type);
    powerUp.animationSpeed = 0.167;
    powerUp.play();
    powerUp.anchor.set(0.5);
    powerUp.x = x;
    powerUp.y = y;
    this.app.stage.addChild(powerUp);
    this.collectables.push(powerUp);
  }

  collect(ship: Ship | undefined): void {
    if (!ship || ship.destroyed) {
      return;
    }

    const powerUp = this.collectables.find(collectable => !collectable.destroyed && ship.hit(collectable));
    if (powerUp) {
      ship.shotSpeed += powerUp.config.powerUp.speed;
      ship.shotPower += powerUp.config.powerUp.shot;
      ship.energy += powerUp.config.powerUp.energy;
      powerUp.destroy();
      this.collectables = this.collectables.filter(collectable => !collectable.destroyed);
    }
  }
}
