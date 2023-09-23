import { PowerUp } from './models/pixijs/power-up-sprite';
import { PowerUpConfig } from './models/power-up-config.model';

interface Config {
  powerUpConfig: PowerUpConfig[];
}

interface GameConfig extends Config {
  enemy: {
    autoSpawnSpeed: number;
  },
  ship: {
    shotSpeed: number;
  }
}

export const GAME_CONFIG: GameConfig = {
  enemy: {
    autoSpawnSpeed: 1.35, // per second
  },
  ship: {
    shotSpeed: 3, // speed in pixel
  },
  powerUpConfig: [
    {
      type: PowerUp.speed,
      assetUrl: 'assets/game/power-up-1.json',
      animationName: 'power-up-1',
      powerUp: {
        speed: 0.1,
        shot: 0,
      },
    },
    {
      type: PowerUp.shot,
      assetUrl: 'assets/game/power-up-2.json',
      animationName: 'power-up-2',
      powerUp: {
        speed: 0,
        shot: 1,
      },
    },
  ],
};
