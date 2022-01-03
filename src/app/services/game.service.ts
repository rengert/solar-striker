import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Collectable } from '../models/collectable.model';
import { RenderObject } from '../models/render-object.model';
import { Ship, Weapon } from '../models/ship.model';
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
        this.checkHits();
        if (value % 600 === 0) {
          this.spawnEnemy(value % clientWidth);
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

  private spawnCollectable(enemy: RenderObject) {
    this.collectable.push(new Collectable(enemy.x, enemy.y));
  }

  private spawnEnemy(position: number) {
    this.enemies.push(new RenderObject(position, 0, 40, 40));
  }

  private checkHits(): void {
    this.hitEnemy();
    this.hitShip();
    this.collect();
  }

  private hitEnemy(): void {
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
  }

  private hitShip(): void {
    const enemy = this.enemies.find(enemy => !enemy.destroyed && enemy.collidate(this.player));
    if (enemy) {
      enemy.destroyed = true;
      this.deaths++;
    }
    this.enemies = this.enemies.filter(enemy => !enemy.destroyed && enemy.y < 2000);
  }

  private collect() {
    const collectable = this.collectable.find(collectable => !collectable.destroyed && collectable.collidate(this.player));
    if (collectable) {
      collectable.destroyed = true;
      this.player.weapon = (this.player.weapon + 1) % Weapon.Auto;
    }
    this.collectable = this.collectable.filter(collectable => !collectable.destroyed && collectable.y < 2000);
  }
}
