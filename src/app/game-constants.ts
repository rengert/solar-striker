import { PowerUp } from './models/pixijs/power-up-sprite';
import { ShipType } from './models/pixijs/ship-type.enum';
import { PowerUpConfig } from './models/power-up-config.model';

export const THE_MIDDLE = 0.5;
export const LARGE_POP_UP_HEIGHT = 420;

interface Config {
  powerUpConfig: PowerUpConfig[];
}

interface GameConfig extends Config {
  enemy: {
    autoSpawnSpeed: number;
    maxCount: number;
  };
  meteor: {
    autoSpawnSpeed: number;
  };
  ships: Record<
    ShipType,
    {
      shotSpeed: number;
      rocketSpeed: number;
      energy: number;
    }
  >;
  killLevelFactor: number;
  collectableFactor: number;
  killsPerCoin: number;
}

export const GAME_CONFIG: GameConfig = {
  killLevelFactor: 0.1,
  collectableFactor: 0.2,
  killsPerCoin: 10,
  enemy: {
    autoSpawnSpeed: 0.35, // per second
    maxCount: 20,
  },
  meteor: {
    autoSpawnSpeed: 0.135, // per second
  },
  ships: {
    [ShipType.ship]: {
      rocketSpeed: 1.99,
      shotSpeed: 1.5,
      energy: 10,
    },
    [ShipType.enemy]: {
      rocketSpeed: 0.4,
      shotSpeed: 0.2,
      energy: 1,
    },
  },
  powerUpConfig: [
    {
      type: PowerUp.speed,
      assetUrl: 'assets/game/powerups/power-up-1.json',
      animationName: 'power-up-1',
      powerUp: {
        speed: 0.1,
        shot: 0,
        energy: 0,
      },
    },
    {
      type: PowerUp.shotSpeed,
      assetUrl: 'assets/game/powerups/power-up-2.json',
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
