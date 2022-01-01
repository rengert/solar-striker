import { LocatedObject } from './located-object.model';

export class RenderObject implements LocatedObject {
  destroyed = false;
  direction: -1 | 0 | 1 = 0;

  x: number;
  y: number;

  private readonly width = 20;
  private readonly height = 20;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(): void {
    this.y += 0.25;
  }

  collidate(item: LocatedObject): boolean {
    const left = this.x - item.x;
    const top = this.y - item.y;
    return left >= -this.width && left <= this.width
      && top >= -this.height && top <= this.height;
  }
}
