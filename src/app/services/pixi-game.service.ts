import { ElementRef, Injectable } from '@angular/core';
import { Application } from 'pixi.js';
import { BehaviorSubject, distinctUntilChanged, filter } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GameSprite } from '../models/pixijs/game-sprite';
import { PixiGameCollectableService } from './pixi-game-collectable.service';
import { PixiGameEnemyService } from './pixi-game-enemy.service';
import { PixiGameLandscapeService } from './pixi-game-landscape.service';
import { PixiGameScreenService } from './pixi-game-screen.service';
import { PixiGameShipService } from './pixi-game-ship.service';

function handleMouseMove(event: { data: { originalEvent: PointerEvent | TouchEvent } }, ship: GameSprite): void {
  if (!ship || ship.destroyed) {
    return;
  }

  ship.x = (event.data.originalEvent as PointerEvent).clientX
    ?? (event.data.originalEvent as TouchEvent).touches[0].clientX;
}

@Injectable()
export class PixiGameService {
  private app!: Application;

  private readonly lifes = new BehaviorSubject(3);
  private readonly level = new BehaviorSubject(1);
  private readonly kills = new BehaviorSubject(0);

  async init(elementRef: ElementRef): Promise<void> {
    this.app = new Application({
      height: elementRef.nativeElement.clientHeight,
      width: elementRef.nativeElement.clientWidth,
      backgroundColor: 0x000000,
    });

    const collectables = new PixiGameCollectableService(this.app);
    await collectables.init();
    const landscape = new PixiGameLandscapeService(this.app);
    const enemy = new PixiGameEnemyService(this.app, collectables);
    await enemy.init();
    const ship = new PixiGameShipService(this.app);
    await ship.init();

    void this.setup(landscape, collectables, enemy, ship).then(() => {
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

      elementRef.nativeElement.appendChild(this.app.view);
    });
  }

  private async setup(
    landscape: PixiGameLandscapeService,
    collectables: PixiGameCollectableService,
    enemy: PixiGameEnemyService,
    ship: PixiGameShipService,
  ): Promise<void> {
    const app = this.app;

    landscape.setup();
    await ship.spawn();
    this.setupInteractions(ship);

    app.ticker.add(async delta => {
      landscape.update(delta);
      enemy.update(delta, this.level.value);

      const hits = await enemy.hit(ship.shots);
      this.kills.next(this.kills.value + hits);
      if (await enemy.kill(ship.instance)) {
        this.lifes.next(this.lifes.value - 1);
        if (this.lifes.value === 0) {
          alert('you are dead!');
          ship.instance.destroy();
        }
      }
      collectables.collect(ship.instance);
      ship.update(delta);
    });
  }

  private setupInteractions(ship: PixiGameShipService): void {
    this.app.stage.eventMode = 'dynamic';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('pointerdown', () => ship.autoFire = true);
    this.app.stage.on('pointerup', () => ship.autoFire = false);
    this.app.stage.on(
      'pointermove',
      (event: unknown) => handleMouseMove(
        event as { data: { originalEvent: PointerEvent | TouchEvent } },
        ship.instance,
      ),
    );
  }
}
