import { Container } from 'pixi.js';
import { PixiGameService } from '../../services/pixi-game.service';

export interface AppScreen extends Container {
  show?(): Promise<void>;

  hide?(): Promise<void>;

  pause?(): Promise<void>;

  resume?(): Promise<void>;

  prepare?(): void;

  reset?(): void;

  update?(delta: number): void;

  resize?(width: number, height: number): void;

  blur?(): void;

  focus?(): void;
}

export interface AppScreenConstructor {
  new(service: PixiGameService): AppScreen;

  /** List of assets bundles required by the screen */
  assetBundles?: string[];
}
