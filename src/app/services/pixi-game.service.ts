import { ElementRef, Injectable } from '@angular/core';
import { AnimatedSprite, Application, InteractionEvent, Spritesheet, Texture } from 'pixi.js';
import { BehaviorSubject, distinctUntilChanged, filter } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BackgroundSprite } from '../models/pixijs/background-sprite';
import { GameSprite } from '../models/pixijs/game-sprite';
import { PowerUp, PowerUpSprite } from '../models/pixijs/power-up-sprite';
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
  private collectables: PowerUpSprite[] = [];
  private readonly landscapes: BackgroundSprite[] = [];
  private enemySprite!: Spritesheet;
  private ship!: Spritesheet;
  private laser!: Spritesheet;
  private explosion!: Spritesheet;

  private player!: GameSprite;


  private autoFire: boolean = false;

  private readonly lifes = new BehaviorSubject(3);
  private readonly level = new BehaviorSubject(1);
  private readonly kills = new BehaviorSubject(0);

  private shotSpeed: number = 1;
  private shotPower: number = 1;

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
      .add('assets/power-up-1.json')
      .add('assets/power-up-2.json')
      .add('background', 'assets/desert-background-looped.png')
      .add('clouds', 'assets/clouds-transparent.png')
      .load(() => {
        this.setup();
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

  private setup(): void {
    const app = this.app;

    this.loadSpritesheets();
    this.setupLandscape();
    this.spawnPlayer();
    this.setupInteractions();

    let elapsed = 0;
    let lastEnemySpawn = -1;
    let lastShot = -1;

    app.ticker.add(delta => {
      elapsed += delta;
      this.landscapes.forEach(item => item.update(delta));
      // loop enemies
      this.enemies
        .filter(enemy => enemy.y > this.app.screen.height + 50)
        .forEach(enemy => {
          enemy.y = 0;
        });
      this.hitEnemy();
      this.dead();
      this.collect();
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
  }

  private setupLandscape(): void {
    const background = new BackgroundSprite(0.25, 0, Texture.from('background'), this.app.screen.width, this.app.screen.height);
    this.landscapes.push(background);
    this.app.stage.addChild(background);

    const cloud = new BackgroundSprite(0, 0.25, Texture.from('clouds'), this.app.screen.width, 103, 0.75);
    cloud.y = Math.floor(this.app.screen.height / 2);
    this.landscapes.push(cloud);
    this.app.stage.addChild(cloud);

    const cloud2 = new BackgroundSprite(0, 0.27, Texture.from('clouds'), this.app.screen.width, 103, 0.8);
    cloud2.y = Math.floor(this.app.screen.height / 4);
    this.landscapes.push(cloud2);
    this.app.stage.addChild(cloud2);
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

  private spawnPowerUp(x: number, y: number): void {
    const rand = Math.random();
    if (rand > 0.1) {
      return;
    }
    const type = Math.random() > 0.5 ? PowerUp.Speed : PowerUp.Shot;
    const powerUp = new PowerUpSprite(
      1,
      type === PowerUp.Speed
        ? this.app.loader.resources['assets/power-up-1.json'].spritesheet !.animations['power-up-1']
        : this.app.loader.resources['assets/power-up-2.json'].spritesheet !.animations['power-up-2'],
      type,
    );
    powerUp.animationSpeed = 0.167;
    powerUp.play();
    powerUp.anchor.set(0.5);
    powerUp.x = x;
    powerUp.y = y;
    this.app.stage.addChild(powerUp);
    this.collectables.push(powerUp);
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
          this.spawnPowerUp(explosion.x, explosion.y);
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

  private collect() {
    if (!this.player || this.player.destroyed) {
      return;
    }

    const powerUp = this.collectables.find(collectable => !collectable.destroyed && this.player.hit(collectable));
    if (powerUp) {
      if (powerUp.type === PowerUp.Speed) {
        this.shotSpeed++;
      }
      if (powerUp.type === PowerUp.Shot) {
        this.shotPower++;
      }
      powerUp.destroy();
      this.collectables = this.collectables.filter(collectable => !collectable.destroyed);
    }
  }
}
