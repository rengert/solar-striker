import { PowerUp } from './models/pixijs/power-up-sprite';
import { ShipType } from './models/pixijs/ship-type.enum';
import { PowerUpConfig } from './models/power-up-config.model';

export const THE_MIDDLE = 0.5;
export const LARGE_POP_UP_HEIGHT = 420;
export const SHIELD_DURATION_MS = 5000;
export const SLOW_MOTION_DURATION_MS = 5000;
export const SPREAD_SHOT_DURATION_MS = 8000;
export const OFF_SCREEN_BUFFER = 50;
export const MAX_SHOT_POWER = 5;
export const MAX_STAGE = 100;

/** Up to this stage the difficulty stays linear like before; the early game was well tuned. */
const DIFFICULTY_CURVE_KNEE = 20;
const DIFFICULTY_CURVE_SOFTNESS = 5;
const REWARD_GROWTH_PER_DIFFICULTY = 0.05;

/**
 * Maps a stage to the level all difficulty formulas use. Linear up to the knee, then it flattens like a square root,
 * so the late campaign stays fair (stage 100 plays like level ~51) and endless stays playable (stage 1000 ~ level 150).
 */
export function getDifficultyLevel(stage: number): number {
  const normalizedStage = Math.max(1, stage);
  if (normalizedStage <= DIFFICULTY_CURVE_KNEE) {
    return normalizedStage;
  }
  const softness = DIFFICULTY_CURVE_SOFTNESS;
  const curve = Math.sqrt(1 + (normalizedStage - DIFFICULTY_CURVE_KNEE) / softness) - 1;
  // eslint-disable-next-line no-magic-numbers
  return Math.round(DIFFICULTY_CURVE_KNEE + 2 * softness * curve);
}

/**
 * Scales a flat reward with the difficulty of the stage, so later stages pay off for the harder fight.
 * Capped at MAX_STAGE, otherwise endless runs would become an unlimited coin source.
 */
export function getStageReward(baseReward: number, stage: number): number {
  const difficulty = getDifficultyLevel(Math.min(stage, MAX_STAGE));
  return Math.round(baseReward * (1 + (difficulty - 1) * REWARD_GROWTH_PER_DIFFICULTY));
}

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
    coinsReward: number;
  };
  collectableFactor: number;
  killsPerCoin: number;
  killsPerStage: number;
}

export const GAME_CONFIG: GameConfig = {
  collectableFactor: 0.3,
  killsPerCoin: 10,
  killsPerStage: 20,
  enemy: {
    autoSpawnSpeed: 0.5, // per second
    maxCount: 20,
  },
  meteor: {
    autoSpawnSpeed: 0.2, // per second
  },
  boss: {
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
    {
      type: PowerUp.nuke,
      assetUrl: 'assets/game/powerups/bolt/bolt.json',
      animationName: 'bolt',
      // eslint-disable-next-line no-magic-numbers
      tint: 0xff4400,
      powerUp: {
        speed: 0,
        shot: 0,
        energy: 0,
        nuke: true,
      },
    },
    {
      type: PowerUp.orb,
      assetUrl: 'assets/game/powerups/pill/pill.json',
      animationName: 'pill',
      // eslint-disable-next-line no-magic-numbers
      tint: 0xaa00ff,
      powerUp: {
        speed: 0,
        shot: 0,
        energy: 3,
      },
    },
    {
      type: PowerUp.orbitalStrike,
      assetUrl: 'assets/game/powerups/bolt/bolt.json',
      animationName: 'bolt',
      // eslint-disable-next-line no-magic-numbers
      tint: 0x00ffff,
      powerUp: {
        speed: 0,
        shot: 0,
        energy: 0,
        orbitalStrike: true,
      },
    },
    {
      type: PowerUp.slowMotion,
      assetUrl: 'assets/game/powerups/power-up-2.json',
      animationName: 'power-up-2',
      // eslint-disable-next-line no-magic-numbers
      tint: 0x66ff66,
      powerUp: {
        speed: 0,
        shot: 0,
        energy: 0,
        slowMotion: SLOW_MOTION_DURATION_MS,
      },
    },
    {
      type: PowerUp.spreadShot,
      assetUrl: 'assets/game/powerups/power-up-1.json',
      animationName: 'power-up-1',
      // eslint-disable-next-line no-magic-numbers
      tint: 0xffdd00,
      powerUp: {
        speed: 0,
        shot: 0,
        energy: 0,
        spreadShot: SPREAD_SHOT_DURATION_MS,
      },
    },
  ],
};
