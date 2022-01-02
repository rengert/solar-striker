import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { tap } from 'rxjs/operators';
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
        this.crash();
        if (value % 200 === 0) {
          this.enemies.push(new RenderObject(value % clientWidth, 0, 20, 20));
        }
        this.enemies.forEach(enemy => enemy.update());
        this.shots.forEach(shot => shot.update());
      }),
    ).subscribe();
  }

  handleMouseMove(event: MouseEvent): void {
    if (this.player.x > event.clientX) {
      this.player.direction = -1;
    } else if (this.player.x < event.clientX) {
      this.player.direction = 1;
    } else {
      this.player.direction = 0;
    }

    this.player.x = event.clientX;
  }

  click(): void {
    this.player.shot();
  }

  private crash(): void {
    this.shots.forEach(shot => {
      const enemy = this.enemies.find(enemy => enemy.collidate(shot));
      if (enemy) {
        enemy.destroyed = true;
        shot.destroyed = true;
        this.kills++;
      }
    });
    this.shots = this.shots.filter(shot => !shot.destroyed && (shot.y > 0));
    const enemy = this.enemies.find(enemy => !enemy.destroyed && enemy.collidate(this.player));
    if (enemy) {
      enemy.destroyed = true;
      this.deaths++;
    }
    this.enemies = this.enemies.filter(enemy => !enemy.destroyed && enemy.y < 2000);
  }
}
