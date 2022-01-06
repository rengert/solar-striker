import { ElementRef, Injectable } from '@angular/core';
import { AnimatedSprite, Application, Sprite, Spritesheet } from 'pixi.js';

@Injectable()
export class PixiGameService {
  private app!: Application;
  private enemies: Sprite[] = [];
  private enemySprite!: Spritesheet;
  private ship!: Spritesheet;

  private player!: AnimatedSprite;

  constructor() {
  }

  init(elementRef: ElementRef): void {
    this.app = new Application({
      height: elementRef.nativeElement.clientHeight,
      width: elementRef.nativeElement.clientWidth,
      backgroundColor: 0x1099bb,
    });
    this.app.loader
      .add('assets/enemy.json')
      .add('assets/ship.json')
      .load(() => this.setup());

    elementRef.nativeElement.appendChild(this.app.view);
  }

  handleMouseMove(event: MouseEvent): void {
    this.player.x = event.clientX;
  }

  private setup(): void {
    const app = this.app;
    this.enemySprite = app.loader.resources['assets/enemy.json'].spritesheet !;
    this.ship = app.loader.resources['assets/ship.json'].spritesheet !;

    const ship = new AnimatedSprite(this.ship.animations['ship']);
    ship.animationSpeed = 0.167;
    ship.play();
    ship.x = Math.floor(app.screen.height / 2);
    ship.y = app.screen.height - 20;
    this.app.stage.addChild(ship);
    this.player = ship;

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
        this.spawnEnemy(eleapsed % (this.app.screen.width - 100) + 25);
      }
    });
  }

  private spawnEnemy(position: number): void {
    const enemy = new AnimatedSprite(this.enemySprite.animations['frame']);
    enemy.animationSpeed = 0.167;
    enemy.play();
    enemy.anchor.set(0.5);
    enemy.x = position;
    enemy.y = 10;
    this.enemies.push(enemy);
    this.app.stage.addChild(enemy);
  }
}
