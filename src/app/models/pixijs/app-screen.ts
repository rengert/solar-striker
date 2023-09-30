import { Container } from 'pixi.js';
import { GameService } from '../../services/game.service';

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
  new(service: GameService): AppScreen;

  assetBundles?: string[];
}
