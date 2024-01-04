import { PowerUp } from './models/pixijs/power-up-sprite';
import { PowerUpConfig } from './models/power-up-config.model';

interface Config {
  powerUpConfig: PowerUpConfig[];
}

interface GameConfig extends Config {
  enemy: {
    autoSpawnSpeed: number;
  },
  meteor: {
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
  meteor: {
    autoSpawnSpeed: 0.35, // per second
  },
  ship: {
    shotSpeed: 6, // speed in pixel
  },
  powerUpConfig: [
    {
      type: PowerUp.speed,
      assetUrl: 'assets/game/power-up-1.json',
      animationName: 'power-up-1',
      powerUp: {
        speed: 0.1,
        shot: 0,
        energy: 0,
      },
    },
    {
      type: PowerUp.shotSpeed,
      assetUrl: 'assets/game/power-up-2.json',
      animationName: 'power-up-2',
      powerUp: {
        speed: 0,
        shot: 1,
        energy: 0,
      },
    },
    {
      type: PowerUp.shotPower,
      assetUrl: 'assets/game/powerups/bolt/bolt.json',
      animationName: 'bolt',
      powerUp: {
        speed: 0.1,
        shot: 0,
        energy: 0,
      },
    },
    {
      type: PowerUp.shotPower,
      assetUrl: 'assets/game/powerups/pill/pill.json',
      animationName: 'pill',
      powerUp: {
        speed: 0.1,
        shot: 0,
        energy: 1,
      },
    },
  ],
};
