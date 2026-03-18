import { PowerUp } from './models/pixijs/power-up-sprite';
import { ShipType } from './models/pixijs/ship-type.enum';
import { PowerUpConfig } from './models/power-up-config.model';

export const THE_MIDDLE = 0.5;
export const LARGE_POP_UP_HEIGHT = 420;
// eslint-disable-next-line no-magic-numbers
export const SHIELD_DURATION_MS = 5000;

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
  boss: {
    killsInterval: number;
    coinsReward: number;
  };
  killLevelFactor: number;
  collectableFactor: number;
  killsPerCoin: number;
}

export const GAME_CONFIG: GameConfig = {
  killLevelFactor: 0.1,
  collectableFactor: 0.2,
  killsPerCoin: 10,
  enemy: {
    autoSpawnSpeed: 0.5, // per second
    maxCount: 20,
  },
  meteor: {
    autoSpawnSpeed: 0.2, // per second
  },
  boss: {
    killsInterval: 50,
    coinsReward: 10,
  },
  ships: {
    [ShipType.ship]: {
      rocketSpeed: 2.5,
      shotSpeed: 2.0,
      energy: 10,
    },
    [ShipType.enemy]: {
      rocketSpeed: 0.55,
      shotSpeed: 0.3,
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
    {
      type: PowerUp.shield,
      assetUrl: 'assets/game/powerups/power-up-2.json',
      animationName: 'power-up-2',
      // eslint-disable-next-line no-magic-numbers
      tint: 0x00ccff,
      powerUp: {
        speed: 0,
        shot: 0,
        energy: 0,
        shield: SHIELD_DURATION_MS,
      },
    },
  ],
};
