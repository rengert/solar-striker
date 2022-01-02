import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Collectable } from '../models/collectable.model';
import { RenderObject } from '../models/render-object.model';
import { Ship } from '../models/ship.model';
import { ShotObject } from '../models/shot-object.model';
import { SoundService } from './sound.service';

const CONFIG = {
  player: {
    width: 64,
  },
};

@Injectable({ providedIn: 'root' })
export class GameService {
  player!: Ship;
  enemies: RenderObject[] = [];
  collectable: Collectable[] = [];
  shots: ShotObject[] = [];
  deaths = 0;
  kills = 0;

  constructor(private readonly sound: SoundService) {
  }

  init(clientWidth: number, clientHeight: number): void {
    this.player = new Ship(200, clientHeight - CONFIG.player.width, this, this.sound);

    // TODO: check if the subscription needs to be cleanup
    interval(5).pipe(
      tap(value => {
        this.shots.forEach(shot => shot.update());
        this.enemies.forEach(enemy => enemy.update());
        this.collectable.forEach(collectable => collectable.update());
        this.player.update();
        this.crash();
        if (value % 200 === 0) {
          this.enemies.push(new RenderObject(value % clientWidth, 0, 40, 40));
        }
      }),
    ).subscribe();
  }

  handleMouseMove(event: MouseEvent): void {
    this.player.move(event.clientX);
  }

  click(): void {
    this.player.shot();
  }

  private crash(): void {
    // shots
    this.shots.forEach(shot => {
      const enemy = this.enemies.find(enemy => enemy.collidate(shot));
      if (enemy) {
        enemy.destroyed = true;
        shot.destroyed = true;
        this.kills++;
        this.spawnCollectable(enemy);
      }
    });
    this.shots = this.shots.filter(shot => !shot.destroyed && (shot.y > 0));
    // enemies
    const enemy = this.enemies.find(enemy => !enemy.destroyed && enemy.collidate(this.player));
    if (enemy) {
      enemy.destroyed = true;
      this.deaths++;
    }
    this.enemies = this.enemies.filter(enemy => !enemy.destroyed && enemy.y < 2000);
    // collectable
    const collectable = this.collectable.find(collectable => !collectable.destroyed && collectable.collidate(this.player));
    if (collectable) {
      collectable.destroyed = true;
      this.player.weapon = collectable.type;
    }
    this.collectable = this.collectable.filter(collectable => !collectable.destroyed && collectable.y < 2000);
  }

  private spawnCollectable(enemy: RenderObject) {
    this.collectable.push(new Collectable(enemy.x, enemy.y));
  }
}
