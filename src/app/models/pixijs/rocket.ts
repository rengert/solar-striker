import { AnimatedGameSprite } from './animated-game-sprite';
import { Ship } from './ship';

export class Rocket extends AnimatedGameSprite {
  reference: Ship | undefined;

  override hit(object2: AnimatedGameSprite): boolean {
    return this.reference !== object2 && super.hit(object2);
  }
}
