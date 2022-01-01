import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RenderObject } from '../models/render-object.model';
import { ShotObject } from '../models/shot-object.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  player = new RenderObject(200, 800);
  enemies: RenderObject[] = [];
  shots: ShotObject[] = [];
  deaths = 0;
  kills = 0;

  constructor() {
  }

  init(clientWidth: number, clientHeight: number): void {
    this.player = new RenderObject(200, clientHeight - 25);

    // TODO: check if the subscription needs to be cleanup
    interval(5).pipe(
      tap(value => {
        this.crash();
        if (value % 200 === 0) {
          this.enemies.push(new RenderObject(value % clientWidth, 0));
        }
        this.enemies.forEach(enemy => enemy.update());
        this.shots.forEach(shot => shot.update());
      }),
    ).subscribe();
  }

  handleMouseMove(event: MouseEvent): void {
    this.player.x = event.clientX;
  }

  click(): void {
    this.shots.push(new ShotObject(this.player.x, this.player.y));
    this.shots.push(new ShotObject(this.player.x + 20, this.player.y));
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
