import { Sprite, Texture, TilingSprite } from 'pixi.js';

export class BackgroundSprite extends TilingSprite {
  private readonly speedTilepositionY: number = 1;
  private readonly speedTilepositionX: number = 1;

  private readonly speedY: number = 0;

  constructor(speedTilepositionY: number, speedTilepositionX: number, texture: Texture, width: number, height: number, speedY = 0) {
    super(texture, width, height);

    this.speedTilepositionY = speedTilepositionY;
    this.speedTilepositionX = speedTilepositionX;

    this.speedY = speedY;
  }

  update(delta: number) {
    this.tilePosition.y += delta * this.speedTilepositionY;
    this.tilePosition.x += delta * this.speedTilepositionX;

    this.y += delta * this.speedY;
    if (this.y > 1000) {
      this.y = -this.height;
    }
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
