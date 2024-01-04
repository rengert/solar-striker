import { AnimatedGameSprite } from './animated-game-sprite';

export class Ship extends AnimatedGameSprite {
  shotPower = 1;
  shotSpeed = 1;

  #energy = 10;

  set energy(value: number) {
    this.#energy = Math.min(value, 10);
  };

  get energy(): number {
    return this.#energy;
  }
}
