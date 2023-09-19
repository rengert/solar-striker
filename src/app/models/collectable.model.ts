import { RenderObject } from './render-object.model';
import { Weapon } from './ship.model';

export class Collectable extends RenderObject {
  type = Weapon.two;

  override update(): void {
    this.y += 0.125;
  }
}
