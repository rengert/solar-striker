import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LocatedObject {
  x: number,
  y: number,
  update: () => void,
  collidate: (item: LocatedObject) => boolean
}

class RenderObject implements LocatedObject {
  destroyed = false;

  x: number;
  y: number;

  private readonly width = 20;
  private readonly height = 20;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(): void {
    this.y += 0.25;
  }

  collidate(item: LocatedObject): boolean {
    const left = this.x - item.x;
    const top = this.y - item.y;
    return left >= -20 && left <= 20
      && top >= -20 && top <= 20;
  }
}

class ShotObject implements LocatedObject {
  destroyed = false;

  x: number;
  y: number;

  private readonly width = 1;
  private readonly height = 1;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(): void {
    this.y -= 2;
  }

  collidate(item: LocatedObject): boolean {
    return (item.x <= this.x && (item.x - 20) >= this.x)
      && (item.y <= this.y && (item.y - 20) >= this.y);
  }
}

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
    console.log(`game init: ${clientWidth} * ${clientHeight}`);

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
