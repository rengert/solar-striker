import { PowerUp } from './pixijs/power-up-sprite';

export interface PowerUpConfig {
  type: PowerUp;
  assetUrl: string;
  animationName: string;
  powerUp: {
    speed: number;
    shot: number;
  };
}
