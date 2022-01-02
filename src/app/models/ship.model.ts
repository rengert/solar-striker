import { GameService } from '../services/game.service';
import { SoundService } from '../services/sound.service';
import { RenderObject } from './render-object.model';
import { ShotObject } from './shot-object.model';

export enum Weapon {
  One,
  Two,
  Three,
}

export class Ship extends RenderObject {
  weapon: Weapon = Weapon.One;

  constructor(x: number, y: number, private readonly game: GameService, private readonly sound: SoundService) {
    super(x, y);
  }

  shot() {
    if (this.weapon === Weapon.One) {
      this.game.shots.push(new ShotObject(this.x + this.width / 2, this.y));
      return;
    }
    void this.sound.playSound();
  }
}
