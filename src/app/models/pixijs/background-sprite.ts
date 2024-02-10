import { Texture, TilingSprite } from 'pixi.js';

export class BackgroundSprite extends TilingSprite {
  // eslint-disable-next-line max-params
  constructor(
    texture: Texture,
    private readonly config: {
      speedTilePositionY: number,
      speedTilePositionX: number,
      width: number,
      height: number,
      speedY?: number,
      maxY?: number
    }) {
    super(texture, config.width, config.height);
  }

  update(delta: number): void {
    this.tilePosition.y += delta * this.config.speedTilePositionY;
    this.tilePosition.x += delta * this.config.speedTilePositionX;

    if (this.config.speedY) {
      this.y += delta * this.config.speedY;
    }
    if (this.y > (this.config.maxY ?? 1000)) {
      this.y = -this.height;
    }
  }
}
