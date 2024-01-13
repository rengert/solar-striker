import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { AppScreen, AppScreenConstructor } from '../models/pixijs/app-screen';
import { CreditsPopup } from '../popups/credits-popup';
import { HighscorePopup } from '../popups/highscore-popup';
import { NavigationPopup } from '../popups/navigation-popup';
import { YouAreDeadPopup } from '../popups/your-are-dead-popup';
import { ApplicationService } from './application.service';
import { GameCollectableService } from './game-collectable.service';
import { GameEnemyService } from './game-enemy.service';
import { GameLandscapeService } from './game-landscape.service';
import { GameMeteorService } from './game-meteor.service';
import { GameScreenService } from './game-screen.service';
import { GameShipService } from './game-ship.service';
import { StorageService } from './storage.service';

function handleMouseMove(event: {
  data: { originalEvent: PointerEvent | TouchEvent }
}, ship: AnimatedGameSprite | undefined): void {
  if (!ship || ship.destroyed) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  ship.targetX = (event.data.originalEvent as PointerEvent).clientX
    ?? (event.data.originalEvent as TouchEvent).touches[0].clientX;
}

@Injectable()
export class GameService {
  private readonly collectables = inject(GameCollectableService);
  private readonly landscape = inject(GameLandscapeService);
  private readonly enemy = inject(GameEnemyService);
  private readonly ship = inject(GameShipService);
  private readonly meteor = inject(GameMeteorService);
  private readonly gameScreen = inject(GameScreenService);

  readonly kills = signal(0);


  private readonly level = computed(() => Math.floor(this.kills() / 10) + 1);

  private currentPopup?: AppScreen;

  private started = signal(false);

  constructor(
    private readonly application: ApplicationService,
    private readonly storage: StorageService,
  ) {
    effect(() => {
      if (!this.started()) {
        return;
      }

      this.gameScreen.kills = this.kills();
      this.gameScreen.level = this.level();
    });
  }

  async init(): Promise<void> {
    await this.collectables.init();
    await this.enemy.init();
    await this.ship.init();
    this.landscape.setup();
    this.gameScreen.init();

    this.setup();

    await this.presentPopup(NavigationPopup);
  }

  // eslint-disable-next-line max-params
  private setup(): void {
    this.ship.spawn();
    this.setupInteractions(this.ship);

    this.application.ticker.add(delta => {
      if (!this.started()) {
        return;
      }
      // moving landscape
      this.landscape.update(delta);
      // spawn enemies
      this.enemy.update(delta, this.level());
      // spawn meteors
      this.meteor.update(delta, this.level());
      this.enemy.hit(this.meteor.meteors, false, false);
      this.meteor.hit(this.ship.shots);
      const hits = this.enemy.hit(this.ship.shots);
      this.kills.update(value => value + hits);
      if (
        this.enemy.kill(this.ship.instance)
        || this.meteor.kill(this.ship.instance)
      ) {
        this.ship.instance.energy -= 1;
        this.gameScreen.lifes = this.ship.instance.energy;
      }

      if (this.ship.instance.energy === 0) {
        void this.storage.setHighscore(this.kills(), this.level());
        void this.presentPopup(YouAreDeadPopup);
        this.ship.instance.destroy();
        this.started.set(false);
      }

      this.gameScreen.lifes = this.ship.instance.energy;
      this.collectables.collect(this.ship.instance);
      this.ship.update(delta);
    });
  }

  private setupInteractions(ship: GameShipService): void {
    this.application.stage.eventMode = 'dynamic';
    this.application.stage.hitArea = this.application.screen;
    this.application.stage.on('pointerdown', () => ship.autoFire = true);
    this.application.stage.on('pointerup', () => ship.autoFire = false);
    this.application.stage.on(
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
      this.application.ticker.remove(screen.update, screen);
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    screen.parent?.removeChild(screen);

    if (screen.reset) {
      screen.reset();
    }
  }

  private async addAndShowScreen(screen: AppScreen): Promise<void> {
    // Add screen to stage
    this.application.stage.addChild(screen);

    // Setup things and pre-organise screen before showing
    if (screen.prepare) {
      screen.prepare();
    }

    if (screen.resize) {
      screen.resize(this.application.screen.width, this.application.screen.height);
    }

    // Add update function if available
    if (screen.update) {
      this.application.ticker.add(screen.update, screen);
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
