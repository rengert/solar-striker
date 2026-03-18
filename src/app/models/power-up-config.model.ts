import { PowerUp } from './pixijs/power-up-sprite';

export interface PowerUpConfig {
  type: PowerUp;
  assetUrl: string;
  animationName: string;
  tint?: number;
  powerUp: {
    speed: number;
    shot: number;
    energy: number;
    shield?: number;
  };
}
