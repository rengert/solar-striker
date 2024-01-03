import { computed, effect, ElementRef, Injectable, signal } from '@angular/core';
import { Application } from 'pixi.js';
import { AppScreen, AppScreenConstructor } from '../models/pixijs/app-screen';
import { GameSprite } from '../models/pixijs/game-sprite';
import { CreditsPopup } from '../popups/credits-popup';
import { HighscorePopup } from '../popups/highscore-popup';
import { NavigationPopup } from '../popups/navigation-popup';
import { YouAreDeadPopup } from '../popups/your-are-dead-popup';
import { GameCollectableService } from './game-collectable.service';
import { GameEnemyService } from './game-enemy.service';
import { GameLandscapeService } from './game-landscape.service';
import { GameScreenService } from './game-screen.service';
import { GameShipService } from './game-ship.service';
import { StorageService } from './storage.service';

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
export class GameService {
  readonly kills = signal(0);

  private app!: Application;
  private gameScreen!: GameScreenService;

  private readonly level = computed(() => Math.floor(this.kills() / 10) + 1);

  private currentPopup?: AppScreen;

  private started = signal(false);

  constructor(private readonly storage: StorageService) {
    effect(() => {
      if (!this.started()) {
        return;
      }

      this.gameScreen.kills = this.kills();
      this.gameScreen.level = this.level();
    });
  }

  async init(elementRef: ElementRef): Promise<void> {
    this.app = new Application({
      height: elementRef.nativeElement.clientHeight,
      width: elementRef.nativeElement.clientWidth,
      backgroundColor: 0x000000,
    });

    const collectables = new GameCollectableService(this.app);
    await collectables.init();
    const landscape = new GameLandscapeService(this.app);
    const enemy = new GameEnemyService(this.app, collectables);
    await enemy.init();
    const ship = new GameShipService(this.app);
    await ship.init();

    landscape.setup();
    this.gameScreen = new GameScreenService(this.app);
    this.setup(landscape, collectables, enemy, ship, this.gameScreen);

    elementRef.nativeElement.appendChild(this.app.view);

    await this.presentPopup(NavigationPopup);
  }

  // eslint-disable-next-line max-params
  private setup(
    landscape: GameLandscapeService,
    collectables: GameCollectableService,
    enemy: GameEnemyService,
    ship: GameShipService,
    gameScreen: GameScreenService,
  ): void {
    const app = this.app;

    ship.spawn();
    this.setupInteractions(ship);

    app.ticker.add(delta => {
      if (!this.started()) {
        return;
      }

      landscape.update(delta);
      enemy.update(delta, this.level());

      const hits = enemy.hit(ship.shots);
      this.kills.update(value => value + hits);
      if (enemy.kill(ship.instance)) {
        ship.instance.energy -= 1;
        gameScreen.lifes = ship.instance.energy;
        if (ship.instance.energy === 0) {
          void this.storage.setHighscore(this.kills(), this.level());
          void this.presentPopup(YouAreDeadPopup);
          ship.instance.destroy();
          this.started.set(false);
        }
      }
      gameScreen.lifes = ship.instance.energy;
      collectables.collect(ship.instance);
      ship.update(delta);
    });
  }

  private setupInteractions(ship: GameShipService): void {
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
    this.started.set(true);
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

  async openHighscore(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    await this.presentPopup(HighscorePopup);
  }
}
