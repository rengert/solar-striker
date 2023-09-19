import { LocatedObject } from './located-object.model';

export class ShotObject implements LocatedObject {
  destroyed = false;

  x: number;
  y: number;
  readonly width = 5;
  readonly height = 5;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(): void {
    this.y -= 2;
  }

  collide(item: LocatedObject): boolean {
    return (item.x <= this.x && (item.x - 20) >= this.x)
      && (item.y <= this.y && (item.y - 20) >= this.y);
  }
}
