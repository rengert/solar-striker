import { GameService } from '../services/game.service';
import { SoundService } from '../services/sound.service';
import { RenderObject } from './render-object.model';
import { ShotObject } from './shot-object.model';

export enum Weapon {
  One,
  Two,
  Three,
  Auto
}

export class Ship extends RenderObject {
  weapon: Weapon = Weapon.One;

  constructor(x: number, y: number, private readonly game: GameService, private readonly sound: SoundService) {
    super(x, y);
  }

  override update(): void {
    if (this.weapon === Weapon.Auto) {
      this.shot();
    }
  }

  shot(): void {
    if (this.weapon === Weapon.One || this.weapon === Weapon.Auto) {
      this.game.shots.push(new ShotObject(this.x + this.width / 2, this.y));
      return;
    }
    if (this.weapon === Weapon.Two) {
      this.game.shots.push(new ShotObject(this.x + 7, this.y));
      this.game.shots.push(new ShotObject(this.x + this.width - 7, this.y));
      return;
    }
    if (this.weapon === Weapon.Three) {
      this.game.shots.push(new ShotObject(this.x + 7, this.y));
      this.game.shots.push(new ShotObject(this.x + this.width / 2, this.y));
      this.game.shots.push(new ShotObject(this.x + this.width - 7, this.y));
      return;
    }
    void this.sound.playSound();
  }

  move(clientX: number): void {
    if (this.x > clientX) {
      this.direction = -1;
    } else if (this.x < clientX) {
      this.direction = 1;
    } else {
      this.direction = 0;
    }

    this.x = clientX;
  }
}
