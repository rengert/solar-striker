import { ElementRef, Injectable } from '@angular/core';
import { AnimatedSprite, Application, InteractionEvent, Sprite, Spritesheet } from 'pixi.js';

@Injectable()
export class PixiGameService {
  private app!: Application;
  private enemies: Sprite[] = [];
  private shots: Sprite[] = [];
  private enemySprite!: Spritesheet;
  private ship!: Spritesheet;
  private laser!: Spritesheet;
  private explosion!: Spritesheet;

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
      .add('assets/laser.json')
      .add('assets/explosion.json')
      .load(() => this.setup());

    elementRef.nativeElement.appendChild(this.app.view);
  }

  private handleMouseMove(event: InteractionEvent): void {
    if (!this.player) {
      return;
    }
    // @ts-ignore
    this.player.x = event.data.originalEvent.clientX ?? event.data.originalEvent.touches[0].clientX;
  }

  private handleClick(): void {
    const shot = new AnimatedSprite(this.laser.animations['laser']);
    shot.animationSpeed = 0.167;
    shot.play();
    shot.anchor.set(0.5);
    shot.x = this.player.x;
    shot.y = this.player.y;
    this.shots.push(shot);
    this.app.stage.addChild(shot);
  }

  private setup(): void {
    const app = this.app;
    this.enemySprite = app.loader.resources['assets/enemy.json'].spritesheet !;
    this.ship = app.loader.resources['assets/ship.json'].spritesheet !;
    this.laser = app.loader.resources['assets/laser.json'].spritesheet !;
    this.explosion = app.loader.resources['assets/explosion.json'].spritesheet !;

    const ship = new AnimatedSprite(this.ship.animations['ship']);
    ship.animationSpeed = 0.167;
    ship.play();
    ship.x = Math.floor(app.screen.width / 2);
    ship.y = app.screen.height - 80;
    this.app.stage.addChild(ship);
    this.player = ship;

    let eleapsed = 0;
    let lastEnemySpawn = -1;
    let lastShot = -1;
    app.stage.interactive = true;

    let autoFire = false;
    app.renderer.plugins['interaction'].on('pointerdown', () => autoFire = true);
    app.renderer.plugins['interaction'].on('pointerup', () => autoFire = false);
    app.renderer.plugins['interaction'].on('pointermove', (event: InteractionEvent) => this.handleMouseMove(event));

    app.ticker.add(delta => {
      eleapsed += delta;
      const mouseCoords = app.renderer.plugins['interaction'].mouse.global;
      if (mouseCoords.x >= 0) {
        // this.player.x = mouseCoords.x;
      }
      // move enemies
      this.enemies.forEach(enemy => {
        enemy.y += delta * 1;
        if (enemy.y > this.app.screen.height + 50) {
          enemy.y = 0;
        }
      });
      this.shots.forEach(shot => {
        shot.y -= delta * 3;
      });
      this.hitEnemy();
      // spawn enemy
      const check = Math.floor(eleapsed);
      if (check % 250 === 0 && check !== lastEnemySpawn) {
        lastEnemySpawn = check;
        this.spawnEnemy(eleapsed % (this.app.screen.width - 100) + 25);
      }
      if (autoFire && check % 10 === 0 && check !== lastShot) {
        lastShot = check;
        this.handleClick();
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

  private hitEnemy(): void {
    this.shots.forEach(shot => {
      if (shot.y < 0) {
        shot.destroy();
        return;
      }
      const enemy = this.enemies.find(enemy => !enemy.destroyed && testForAABB(enemy, shot));
      if (enemy) {
        // explode
        const explosion = new AnimatedSprite(this.explosion.animations['explosion']);
        explosion.animationSpeed = 0.167;
        explosion.loop = false;
        explosion.x = enemy.x;
        explosion.y = enemy.y;
        explosion.onComplete = () => explosion.destroy();
        this.app.stage.addChild(explosion);
        enemy.destroy();
        shot.destroy();
        explosion.play();
      }
    });
    this.enemies = this.enemies.filter(enemy => !enemy.destroyed);
    this.shots = this.shots.filter(shot => !shot.destroyed);
  }
}

function testForAABB(object1: Sprite, object2: Sprite): boolean {
  const bounds1 = object1.getBounds();
  const bounds2 = object2.getBounds();

  return bounds1.x < bounds2.x + bounds2.width
    && bounds1.x + bounds1.width > bounds2.x
    && bounds1.y < bounds2.y + bounds2.height
    && bounds1.y + bounds1.height > bounds2.y;
}
