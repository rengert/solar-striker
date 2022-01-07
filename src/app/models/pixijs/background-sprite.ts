import { Sprite, Texture, TilingSprite } from 'pixi.js';

export class BackgroundSprite extends TilingSprite {
  private readonly speed: number = 1;

  constructor(speed: number, texture: Texture, width: number, height: number) {
    super(texture, width, height);

    this.speed = speed;
  }

  update(delta: number) {
    this.tilePosition.y += delta * this.speed;
  }

  hit(object2: Sprite): boolean {
    const bounds1 = this.getBounds();
    const bounds2 = object2.getBounds();

    return bounds1.x < bounds2.x + bounds2.width
      && bounds1.x + bounds1.width > bounds2.x
      && bounds1.y < bounds2.y + bounds2.height
      && bounds1.y + bounds1.height > bounds2.y;
  }
}
