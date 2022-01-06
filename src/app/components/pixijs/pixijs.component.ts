import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { AnimatedSprite, Application, Sprite, Spritesheet } from 'pixi.js';

@Component({
  selector: 'app-pixijs',
  templateUrl: './pixijs.component.html',
  styleUrls: ['./pixijs.component.scss'],
})
export class PixijsComponent implements OnInit {
  private app!: Application;
  private enemies: Sprite[] = [];

  private enemySprite!: Spritesheet;

  constructor(private readonly elementRef: ElementRef, private readonly ngZone: NgZone) {
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.app = new Application({
        height: this.elementRef.nativeElement.clientHeight,
        width: this.elementRef.nativeElement.clientWidth,
        backgroundColor: 0x1099bb,
      });
      this.app.loader
        .add('assets/enemy.json')
        .load(() => this.setup());
    });
    this.elementRef.nativeElement.appendChild(this.app.view);
  }

  spawnEnemy(position: number): void {
    const bunny = new AnimatedSprite(this.enemySprite.animations['frame']);
    bunny.animationSpeed = 0.167;
    bunny.play();
    bunny.anchor.set(0.5);
    bunny.x = position;
    bunny.y = 10;
    this.enemies.push(bunny);
    this.app.stage.addChild(bunny);
  }

  private setup(): void {
    const app = this.app;
    this.enemySprite = app.loader.resources['assets/enemy.json'].spritesheet !;
    let eleapsed = 0;
    let lastEnemySpawn = -1;
    app.ticker.add(delta => {
      eleapsed += delta;
      // move enemies
      this.enemies.forEach(enemy => {
        enemy.y += delta * 1;
      });
      // spawn enemy
      const enemySpawnCheck = Math.floor(eleapsed);
      if (enemySpawnCheck % 250 === 0 && enemySpawnCheck !== lastEnemySpawn) {
        lastEnemySpawn = enemySpawnCheck;
        this.spawnEnemy(eleapsed % (this.elementRef.nativeElement.clientWidth - 100) + 25);
      }
    });
  }
}



