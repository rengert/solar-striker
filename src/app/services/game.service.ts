import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { FederatedPointerEvent } from 'pixi.js';
import { GAME_CONFIG } from '../game-constants';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { AppScreen, AppScreenConstructor } from '../models/pixijs/app-screen';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { ShipUpgradeType } from '../models/ship-upgrade.model';
import { CreditsPopup } from '../popups/credits-popup';
import { HangarPopup } from '../popups/hangar-popup';
import { HighscorePopup } from '../popups/highscore-popup';
import { NavigationPopup } from '../popups/navigation-popup';
import { PausePopup } from '../popups/pause-popup';
import { SettingsPopup } from '../popups/settings-popup';
import { YouAreDeadPopup } from '../popups/your-are-dead-popup';
import { handleMouseMove } from '../utils/mouse.util';
import { ApplicationService } from './application.service';
import { GameCollectableService } from './game-collectable.service';
import { GameEnemyService } from './game-enemy.service';
import { GameLandscapeService } from './game-landscape.service';
import { GameMeteorService } from './game-meteor.service';
import { GameScreenService } from './game-screen.service';
import { GameShipService } from './game-ship.service';
import { GameShotService } from './game-shot.service';
import { ObjectModelType, ObjectService } from './object.service';
import { ShipUpgradeService } from './ship-upgrade.service';
import { TranslationService } from './translation.service';
import { StorageService } from './storage.service';
import { UpdatableService } from './updatable.service';

const METEOR_COIN_ENERGY_STEP = 20;

const COMBO_WINDOW_MS = 3000;
const MAX_COMBO = 5;

function isShipDestroyer(by: ObjectModelType): boolean {
  return by.type === ObjectType.ship || by.reference?.type === ObjectType.ship;
}

function calculateMeteorCoins(meteor: ObjectModelType): number {
  const energy = meteor.initialEnergy ?? meteor.energy ?? 0;

  return Math.max(1, Math.floor(energy / METEOR_COIN_ENERGY_STEP));
}

@Injectable()
export class GameService {
  readonly kills = signal(0);
  readonly storedCoins = signal(0);
  readonly sessionCoins = signal(0);
  readonly coins = computed(() => this.storedCoins() + this.sessionCoins());
  readonly combo = signal(1);
  readonly highestCombo = signal(1);

  private comboTimer?: number;

  private readonly collectables = inject(GameCollectableService);
  private readonly landscape = inject(GameLandscapeService);
  private readonly enemy = inject(GameEnemyService);
  private readonly ship = inject(GameShipService);
  private readonly meteor = inject(GameMeteorService);
  private readonly gameScreen = inject(GameScreenService);
  private readonly object = inject(ObjectService);
  private readonly shotService = inject(GameShotService);
  readonly shipUpgrades = inject(ShipUpgradeService);
  private readonly translation = inject(TranslationService);
  private rewardedMeteors = new WeakSet<ObjectModelType>();
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
  private readonly level = computed(
    () => Math.floor(this.kills() * GAME_CONFIG.killLevelFactor) + 1,
  );

  private currentPopup?: AppScreen;

  private readonly started = signal(false);
  readonly #paused = signal(false);
  readonly paused = this.#paused.asReadonly();

  private readonly application = inject(ApplicationService);
  private readonly storage = inject(StorageService);

  constructor() {
    effect(() => {
      this.gameScreen.coins = this.coins();

      if (!this.started()) {
        return;
      }

      this.gameScreen.kills = this.kills();
      this.gameScreen.level = this.level();
      this.gameScreen.combo = this.combo();
      this.gameScreen.highestCombo = this.highestCombo();
      void this.storage.setCoins(this.coins());
    });

    this.object.onDestroyed(ObjectType.enemy, (destroyedEnemy, by) => {
      if (by.type === ObjectType.ship || by.reference?.type === ObjectType.ship) {
        this.kills.update((value) => value + 1);
        const newKills = this.kills();
        // increase combo on player kill
        this.increaseCombo();
        if (newKills % GAME_CONFIG.killsPerCoin === 0) {
          this.addCoins(1);
        }
        if ((destroyedEnemy as AnimatedGameSprite).isBoss) {
          this.addCoins(GAME_CONFIG.boss.coinsReward);
        }
      }
    });

    this.object.onDestroyed(ObjectType.meteor, (meteor, by) => {
      if (!this.started() || !isShipDestroyer(by)) {
        return;
      }

      const coins = calculateMeteorCoins(meteor);

      if (coins <= 0 || this.rewardedMeteors.has(meteor)) {
        return;
      }

      this.rewardedMeteors.add(meteor);
      this.addCoins(coins);
    });
  }

  private increaseCombo(): void {
    // If timer is active, we are in a combo window
    const currentCombo = this.combo();

    if (this.comboTimer) {
      // increase combo but do not exceed MAX_COMBO
      const next = Math.min(MAX_COMBO, currentCombo + 1);
      this.combo.set(next);
      this.highestCombo.set(Math.max(this.highestCombo(), next));
      window.clearTimeout(this.comboTimer);
      this.comboTimer = window.setTimeout(() => this.resetCombo(), COMBO_WINDOW_MS);
      return;
    }

    // No timer -> start a new combo sequence (combo becomes 2)
    const startedCombo = 2;
    this.combo.set(startedCombo);
    this.highestCombo.set(Math.max(this.highestCombo(), startedCombo));
    this.comboTimer = window.setTimeout(() => this.resetCombo(), COMBO_WINDOW_MS);
  }

  private resetCombo(): void {
    this.combo.set(1);
    if (this.comboTimer) {
      window.clearTimeout(this.comboTimer);
      this.comboTimer = undefined;
    }
  }

  private addCoins(baseCoins: number): void {
    // multiply awarded coins by current combo
    const multiplier = Math.max(1, Math.floor(this.combo()));
    const amount = Math.max(0, Math.floor(baseCoins * multiplier));
    if (amount === 0) {
      return;
    }
    this.sessionCoins.update((value) => value + amount);
  }

  async init(): Promise<void> {
    await this.translation.init();
    await document.fonts.load('900 10px "Font Awesome 6 Free"');
    await this.collectables.init();
    await this.enemy.init();
    await this.ship.init();
    await this.shotService.init();
    this.landscape.setup();
    this.gameScreen.init();

    await this.shipUpgrades.init();
    const storedCoins = await this.storage.getCoins();
    this.storedCoins.set(storedCoins);

    this.setup();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.started() && !this.#paused()) {
        void this.pause();
      }
    });

    await this.presentPopup(NavigationPopup);
  }

  async start(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    const storedCoins = await this.storage.getCoins();
    this.storedCoins.set(storedCoins);
    this.rewardedMeteors = new WeakSet<ObjectModelType>();
    this.sessionCoins.set(0);
    this.ship.applyUpgrades();
    this.kills.set(0);
    this.ship.instance.autoFire = false;
    this.#paused.set(false);
    this.started.set(true);
    this.gameScreen.pauseButtonVisible = true;
  }

  async openCredits(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    await this.presentPopup(CreditsPopup);
  }

  async pause(): Promise<void> {
    if (!this.started() || this.#paused()) {
      return;
    }

    this.ship.instance.autoFire = false;
    this.#paused.set(true);
    this.application.ticker.stop();
    await this.presentPopup(PausePopup);
  }

  async resume(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    this.currentPopup = undefined;
    this.#paused.set(false);
    this.application.ticker.start();
  }

  async openNavigation(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    await this.presentPopup(NavigationPopup);
  }

  async openHangar(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    await this.presentPopup(HangarPopup);
  }

  async openSettings(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    await this.presentPopup(SettingsPopup);
  }

  async endGame(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    window.location.reload();
  }

  async openHighscore(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    await this.presentPopup(HighscorePopup);
  }

  // eslint-disable-next-line max-params
  private setup(): void {
    this.ship.spawn();
    this.setupInteractions(this.ship);
    this.gameScreen.onPause = (): void => void this.pause();

    this.application.ticker.add((delta) => {
      if (!this.started() || this.#paused()) {
        return;
      }

      this.updatables.forEach((updatable) => updatable.update(delta, this.level()));

      if (this.ship.instance.energy === 0) {
        void this.storage.setHighscore(this.kills(), this.level());
        void this.presentPopup(YouAreDeadPopup);
        this.ship.instance.autoFire = false;
        this.started.set(false);
        this.gameScreen.pauseButtonVisible = false;
      }
    });
  }

  private setupInteractions(ship: GameShipService): void {
    this.application.stage.eventMode = 'dynamic';
    this.application.stage.hitArea = this.application.screen;
    this.application.stage.on('pointerdown', () => {
      if (!this.started() || this.#paused()) {
        return;
      }

      ship.instance.autoFire = true;
    });
    this.application.stage.on('pointerup', () => (ship.instance.autoFire = false));
    this.application.stage.on('pointermove', (event: FederatedPointerEvent) => {
      if (!this.started() || this.#paused()) {
        return;
      }

      handleMouseMove(event, ship.instance);
    });
  }

  private async presentPopup(ctor: AppScreenConstructor): Promise<void> {
    if (this.currentPopup) {
      await this.hideAndRemoveScreen(this.currentPopup);
    }

    this.currentPopup = new ctor(this, this.translation);
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

  async handleUpgradePurchase(type: ShipUpgradeType): Promise<boolean> {
    const cost = this.shipUpgrades.getUpgradeCost(type);

    if (cost === null) {
      return false;
    }

    if (this.coins() < cost) {
      return false;
    }

    const previousStoredCoins = this.storedCoins();
    const previousSessionCoins = this.sessionCoins();

    this.applyCoinCost(cost);
    const upgraded = await this.shipUpgrades.levelUp(type);

    if (!upgraded) {
      this.storedCoins.set(previousStoredCoins);
      this.sessionCoins.set(previousSessionCoins);
      return false;
    }

    this.ship.applyUpgrades();

    if (this.started()) {
      this.gameScreen.coins = this.coins();
    }

    return true;
  }

  private applyCoinCost(cost: number): void {
    let remainingCost = cost;
    const storedCoins = this.storedCoins();

    if (storedCoins >= remainingCost) {
      this.storedCoins.set(storedCoins - remainingCost);
      return;
    }

    remainingCost -= storedCoins;
    this.storedCoins.set(0);

    const sessionCoins = this.sessionCoins();
    this.sessionCoins.set(Math.max(0, sessionCoins - remainingCost));
  }
}
