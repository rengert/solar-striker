import { LocatedObject } from './located-object.model';

export class RenderObject implements LocatedObject {
  destroyed = false;
  direction: -1 | 0 | 1 = 0;
  x: number;
  y: number;

  readonly width: number;
  readonly height: number;

  constructor(x: number, y: number, width = 64, height = 64) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  update(): void {
    this.y += 0.25;
  }

  collide(item: LocatedObject): boolean {
    const small = item.width < this.width ? item : this;
    const large = item.width >= this.width ? item : this;

    const leftIsIn = small.x >= large.x && small.x <= large.x + large.width;
    const rightIsIn = (small.x + small.width) >= large.x && (small.x + small.width) <= (large.x + large.width);
    const topIsIn = small.y >= large.y && small.y <= large.y + large.height;
    const bottomIsIn = (small.y + small.height) >= large.y && (small.y + small.height) <= large.y + large.height;

    return (leftIsIn || rightIsIn) && (topIsIn || bottomIsIn);
  }
}
