import { Texture, TilingSprite } from 'pixi.js';

export class BackgroundSprite extends TilingSprite {
  constructor(
    private readonly speedTilepositionY: number,
    private readonly speedTilepositionX: number,
    texture: Texture,
    width: number,
    height: number,
    private readonly speedY = 0,
    private readonly maxY = 1000) {
    super(texture, width, height);

    this.speedTilepositionY = speedTilepositionY;
    this.speedTilepositionX = speedTilepositionX;
  }

  update(delta: number) {
    this.tilePosition.y += delta * this.speedTilepositionY;
    this.tilePosition.x += delta * this.speedTilepositionX;

    this.y += delta * this.speedY;
    if (this.y > this.maxY) {
      this.y = -this.height;
    }
  }
}
