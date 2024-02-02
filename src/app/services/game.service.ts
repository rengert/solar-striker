import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { AppScreen, AppScreenConstructor } from '../models/pixijs/app-screen';
import { ObjectType } from '../models/pixijs/object-type.enum';
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
import { GameShotService } from './game-shot.service';
import { ObjectService } from './object.service';
import { StorageService } from './storage.service';
import { UpdatableService } from './updatable.service';

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
  private readonly object = inject(ObjectService);
  private readonly shotService = inject(GameShotService);

  private readonly updatables: UpdatableService[] = [
    this.collectables,
    this.landscape,
    this.enemy,
    this.ship,
    this.meteor,
    this.shotService,
    this.object,
    this.gameScreen,
  ];

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

    this.object.onDestroyed(ObjectType.enemy, (_, by) => {
      if (by.type === ObjectType.ship || by.reference?.type === ObjectType.ship) {
        this.kills.update(value => value + 1);
      }
    });
  }

  async init(): Promise<void> {
    await this.collectables.init();
    await this.enemy.init();
    await this.ship.init();
    await this.shotService.init();
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

      this.updatables.forEach(updatable => updatable.update(delta, this.level()));
      
      if (this.ship.instance.energy === 0) {
        void this.storage.setHighscore(this.kills(), this.level());
        void this.presentPopup(YouAreDeadPopup);
        this.started.set(false);
      }
    });
  }

  private setupInteractions(ship: GameShipService): void {
    this.application.stage.eventMode = 'dynamic';
    this.application.stage.hitArea = this.application.screen;
    this.application.stage.on('pointerdown', () => ship.instance.autoFire = true);
    this.application.stage.on('pointerup', () => ship.instance.autoFire = false);
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
