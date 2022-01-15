import { ElementRef, Injectable } from '@angular/core';
import { AnimatedSprite, Application, InteractionEvent, Spritesheet } from 'pixi.js';
import { BehaviorSubject, distinctUntilChanged, filter } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GameSprite } from '../models/pixijs/game-sprite';
import { PixiGameCollectableService } from './pixi-game-collectable.service';
import { PixiGameLandscapeService } from './pixi-game-landscape.service';
import { PixiGameScreenService } from './pixi-game-screen.service';

@Injectable()
export class PixiGameService {
  private readonly config = {
    player: {
      autoFireSpeed: 6, // per second
    },
    enemy: {
      autoSpawnSpeed: 0.25, // per second
    },
  };
  private app!: Application;

  private enemies: GameSprite[] = [];
  private shots: GameSprite[] = [];
  private enemySprite!: Spritesheet;
  private ship!: Spritesheet;
  private laser!: Spritesheet;
  private explosion!: Spritesheet;

  private player!: GameSprite;

  private autoFire: boolean = false;

  private readonly lifes = new BehaviorSubject(3);
  private readonly level = new BehaviorSubject(1);
  private readonly kills = new BehaviorSubject(0);

  constructor(private readonly collectables: PixiGameCollectableService) {
  }

  init(elementRef: ElementRef): void {
    this.app = new Application({
      height: elementRef.nativeElement.clientHeight,
      width: elementRef.nativeElement.clientWidth,
      backgroundColor: 0x1099bb,
    });

    this.collectables.app = this.app;

    const landscape = new PixiGameLandscapeService(this.app);

    this.app.loader
      .add('assets/enemy.json')
      .add('assets/ship.json')
      .add('assets/laser.json')
      .add('assets/explosion.json')
      .load(() => {
        this.setup(landscape);
        const gameScreen = new PixiGameScreenService(this.app);
        this.kills.pipe(
          distinctUntilChanged(),
          filter(value => !!value),
          tap(value => this.level.next(Math.ceil(value / 10))),
          tap(value => gameScreen.kills = value),
        ).subscribe();
        this.lifes.pipe(
          distinctUntilChanged(),
          tap(value => gameScreen.lifes = value),
        ).subscribe();
        this.level.pipe(
          distinctUntilChanged(),
          tap(value => gameScreen.level = value),
        ).subscribe();
      });

    elementRef.nativeElement.appendChild(this.app.view);
  }

  private handleMouseMove(event: InteractionEvent): void {
    if (!this.player || this.player.destroyed) {
      return;
    }
    // @ts-ignore
    this.player.x = event.data.originalEvent.clientX ?? event.data.originalEvent.touches[0].clientX;
  }

  private shot(): void {
    if (!this.player || this.player.destroyed) {
      return;
    }

    const shot = new GameSprite(-3, this.laser.animations['laser']);
    shot.animationSpeed = 0.167;
    shot.play();
    shot.anchor.set(0.5);
    shot.x = this.player.x;
    shot.y = this.player.y;
    this.shots.push(shot);
    this.app.stage.addChild(shot);
  }

  private setup(landscape: PixiGameLandscapeService): void {
    const app = this.app;

    this.loadSpritesheets();
    landscape.setup();
    this.spawnPlayer();
    this.setupInteractions();

    let elapsed = 0;
    let lastEnemySpawn = -1;
    let lastShot = -1;

    app.ticker.add(delta => {
      elapsed += delta;

      landscape.update(delta);

      // loop enemies
      this.enemies
        .filter(enemy => enemy.y > this.app.screen.height + 50)
        .forEach(enemy => {
          enemy.y = 0;
        });
      this.hitEnemy();
      this.dead();
      this.collectables.collect();
      // spawn enemy
      const check = Math.floor(elapsed);
      if (((check % Math.floor(60 / (this.config.enemy.autoSpawnSpeed + (0.1 * (this.level.value - 1))))) === 0)
        && (check !== lastEnemySpawn)) {
        lastEnemySpawn = check;
        this.spawnEnemy(elapsed % (this.app.screen.width - 100) + 25);
      }
      if (this.autoFire && (check % (60 / this.config.player.autoFireSpeed) === 0) && (check !== lastShot)) {
        lastShot = check;
        this.shot();
      }
    });
  }

  private setupInteractions(): void {
    this.app.renderer.plugins['interaction'].on('pointerdown', () => this.autoFire = true);
    this.app.renderer.plugins['interaction'].on('pointerup', () => this.autoFire = false);
    this.app.renderer.plugins['interaction'].on('pointermove', (event: InteractionEvent) => this.handleMouseMove(event));
  }

  private spawnPlayer() {
    const ship = new GameSprite(0, this.ship.animations['ship']);
    ship.animationSpeed = 0.167;
    ship.play();
    ship.x = Math.floor(this.app.screen.width / 2);
    ship.y = this.app.screen.height - 80;
    this.app.stage.addChild(ship);
    this.player = ship;
    this.collectables.player = this.player;
  }

  private loadSpritesheets() {
    this.enemySprite = this.app.loader.resources['assets/enemy.json'].spritesheet !;
    this.ship = this.app.loader.resources['assets/ship.json'].spritesheet !;
    this.laser = this.app.loader.resources['assets/laser.json'].spritesheet !;
    this.explosion = this.app.loader.resources['assets/explosion.json'].spritesheet !;
  }

  private spawnEnemy(position: number): void {
    const enemy = new GameSprite(1 + (0.25 * (this.level.value - 1)), this.enemySprite.animations['frame']);
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
      const enemy = this.enemies.find(enemy => !enemy.destroyed && shot.hit(enemy));
      if (enemy) {
        // explode
        const explosion = new AnimatedSprite(this.explosion.animations['explosion']);
        explosion.animationSpeed = 0.167;
        explosion.loop = false;
        explosion.x = enemy.x;
        explosion.y = enemy.y;
        explosion.onComplete = () => {
          this.collectables.spawn(explosion.x, explosion.y);
          explosion.destroy();
        };
        this.app.stage.addChild(explosion);
        enemy.destroy();
        shot.destroy();
        explosion.play();
        this.kills.next(this.kills.value + 1);
      }
    });
    this.enemies = this.enemies.filter(enemy => !enemy.destroyed);
    this.shots = this.shots.filter(shot => !shot.destroyed);
  }

  private dead() {
    if (!this.player || this.player.destroyed) {
      return;
    }

    const enemy = this.enemies.find(enemy => !enemy.destroyed && this.player.hit(enemy));
    if (enemy) {
      const explosion = new AnimatedSprite(this.explosion.animations['explosion']);
      explosion.animationSpeed = 0.167;
      explosion.loop = false;
      explosion.x = enemy.x;
      explosion.y = enemy.y;
      explosion.onComplete = () => {
        explosion.destroy();
        this.lifes.next(this.lifes.value - 1);
        if (this.lifes.value === 0) {
          alert('you are dead!');
          this.player.destroy();
        }
      };
      this.app.stage.addChild(explosion);
      enemy.destroy();
      explosion.play();

      this.enemies = this.enemies.filter(enemy => !enemy.destroyed);
    }
  }
}
