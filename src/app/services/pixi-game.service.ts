import { ElementRef, Injectable } from '@angular/core';
import { Application } from 'pixi.js';
import { BehaviorSubject, distinctUntilChanged, filter } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppScreen, AppScreenConstructor } from '../models/pixijs/app-screen';
import { GameSprite } from '../models/pixijs/game-sprite';
import { CreditsPopup } from '../popups/credits-popup';
import { NavigationPopup } from '../popups/navigation-popup';
import { YouAreDeadPopup } from '../popups/your-are-dead-popup';
import { PixiGameCollectableService } from './pixi-game-collectable.service';
import { PixiGameEnemyService } from './pixi-game-enemy.service';
import { PixiGameLandscapeService } from './pixi-game-landscape.service';
import { PixiGameScreenService } from './pixi-game-screen.service';
import { PixiGameShipService } from './pixi-game-ship.service';

function handleMouseMove(event: {
  data: { originalEvent: PointerEvent | TouchEvent }
}, ship: GameSprite | undefined): void {
  if (!ship || ship.destroyed) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  ship.x = (event.data.originalEvent as PointerEvent).clientX
    ?? (event.data.originalEvent as TouchEvent).touches[0].clientX;
}

@Injectable()
export class PixiGameService {
  readonly kills = new BehaviorSubject(0);

  private app!: Application;

  private readonly lifes = new BehaviorSubject(3);
  private readonly level = new BehaviorSubject(1);

  private currentPopup?: AppScreen;

  private started = false;

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

    this.setup(landscape, collectables, enemy, ship);
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

    await this.presentPopup(NavigationPopup);
  }

  private setup(
    landscape: PixiGameLandscapeService,
    collectables: PixiGameCollectableService,
    enemy: PixiGameEnemyService,
    ship: PixiGameShipService,
  ): void {
    const app = this.app;

    landscape.setup();
    ship.spawn();
    this.setupInteractions(ship);

    app.ticker.add(delta => {
      if (!this.started) {
        return;
      }

      landscape.update(delta);
      enemy.update(delta, this.level.value);

      const hits = enemy.hit(ship.shots);
      this.kills.next(this.kills.value + hits);
      if (enemy.kill(ship.instance)) {
        this.lifes.next(this.lifes.value - 1);
        if (this.lifes.value === 0) {
          void this.presentPopup(YouAreDeadPopup);
          ship.instance.destroy();
          this.started = false;
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

  private async presentPopup(ctor: AppScreenConstructor): Promise<void> {
    if (this.currentPopup) {
      await this.hideAndRemoveScreen(this.currentPopup);
    }

    this.currentPopup = new ctor(this);
    await this.addAndShowScreen(this.currentPopup);
  }

  private async hideAndRemoveScreen(screen: AppScreen): Promise<void> {
    screen.interactiveChildren = false;
    if (screen.hide) {
      await screen.hide();
    }

    if (screen.update) {
      this.app.ticker.remove(screen.update, screen);
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    screen.parent?.removeChild(screen);

    if (screen.reset) {
      screen.reset();
    }
  }

  private async addAndShowScreen(screen: AppScreen): Promise<void> {
    // Add screen to stage
    this.app.stage.addChild(screen);

    // Setup things and pre-organise screen before showing
    if (screen.prepare) {
      screen.prepare();
    }

    if (screen.resize) {
      screen.resize(this.app.screen.width, this.app.screen.height);
    }

    // Add update function if available
    if (screen.update) {
      this.app.ticker.add(screen.update, screen);
    }

    // Show the new screen
    if (screen.show) {
      screen.interactiveChildren = false;
      await screen.show();
      screen.interactiveChildren = true;
    }
  }

  async start(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    this.started = true;
  }

  async openCredits(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    await this.presentPopup(CreditsPopup);
  }

  async openNavigation(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    await this.presentPopup(NavigationPopup);
  }

  async endGame(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    window.location.reload();
  }
}
