import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { FederatedPointerEvent } from 'pixi.js';
import { GAME_CONFIG, MAX_STAGE } from '../game-constants';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { AppScreen, AppScreenConstructor } from '../models/pixijs/app-screen';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { PlayerShipClass } from '../models/player-ship-class.model';
import { ShipUpgradeType } from '../models/ship-upgrade.model';
import { AchievementsPopup } from '../popups/achievements-popup';
import { CreditsPopup } from '../popups/credits-popup';
import { DailyChallengesPopup } from '../popups/daily-challenges-popup';
import { HangarPopup } from '../popups/hangar-popup';
import { HighscorePopup } from '../popups/highscore-popup';
import { NavigationPopup } from '../popups/navigation-popup';
import { PausePopup } from '../popups/pause-popup';
import { SettingsPopup } from '../popups/settings-popup';
import { VictoryPopup } from '../popups/victory-popup';
import { YouAreDeadPopup } from '../popups/your-are-dead-popup';
import { handleMouseMove } from '../utils/mouse.util';
import { AchievementService } from './achievement.service';
import { ApplicationService } from './application.service';
import { DailyChallengeService } from './daily-challenge.service';
import { GameCollectableService } from './game-collectable.service';
import { GameEnemyService } from './game-enemy.service';
import { GameLandscapeService } from './game-landscape.service';
import { GameMeteorService } from './game-meteor.service';
import { GameScreenService } from './game-screen.service';
import { GameShipService } from './game-ship.service';
import { GameShotService } from './game-shot.service';
import { ObjectModelType, ObjectService } from './object.service';
import { PlayerShipService } from './player-ship.service';
import { ShipUpgradeService } from './ship-upgrade.service';
import { TranslationService } from './translation.service';
import { StorageService } from './storage.service';
import { UpdatableService } from './updatable.service';

const METEOR_COIN_ENERGY_STEP = 20;

const COMBO_WINDOW_MS = 3000;
const MAX_COMBO = 5;

const STAGE_BONUS_COINS = 10;
const STREAK_INTERVAL_MS = 15_000;
const STREAK_BONUS_COINS = 3;
const STAGE_KILL_BASE = 24;
const STAGE_KILL_GROWTH_INTERVAL = 10;
const STAGE_KILL_GROWTH_AMOUNT = 2;
const STAGE_KILL_CAP = 42;

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
  readonly stage = signal(1);
  readonly savedStage = signal<number | null>(null);

  private comboTimer?: number;

  private stageKills = 0;
  private lastShipEnergy = 0;
  private streakElapsedMs = 0;
  private nextStreakMilestoneMs = STREAK_INTERVAL_MS;

  private readonly collectables = inject(GameCollectableService);
  private readonly landscape = inject(GameLandscapeService);
  private readonly enemy = inject(GameEnemyService);
  private readonly ship = inject(GameShipService);
  private readonly meteor = inject(GameMeteorService);
  private readonly gameScreen = inject(GameScreenService);
  private readonly object = inject(ObjectService);
  private readonly shotService = inject(GameShotService);
  readonly shipUpgrades = inject(ShipUpgradeService);
  readonly playerShipService = inject(PlayerShipService);
  readonly achievementService = inject(AchievementService);
  readonly dailyChallengeService = inject(DailyChallengeService);
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
      this.gameScreen.level = this.stage();
      this.gameScreen.combo = this.combo();
      this.gameScreen.highestCombo = this.highestCombo();
      void this.storage.setCoins(this.coins());
    });

    // Achievement: track combo milestones
    effect(() => {
      const combo = this.combo();
      this.achievementService.checkMilestone('combo_rookie', combo);
      this.achievementService.checkMilestone('combo_master', combo);
      this.dailyChallengeService.checkCombo(combo);
    });

    // Achievement: track level milestones
    effect(() => {
      const level = this.stage();
      this.achievementService.checkMilestone('level_10', level);
      this.achievementService.checkMilestone('level_20', level);
      this.dailyChallengeService.checkLevel(level);
    });

    // Achievement: track session coins (rich_pilot)
    effect(() => {
      const sessionCoins = this.sessionCoins();
      this.achievementService.checkMilestone('rich_pilot', sessionCoins);
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
        const isBoss = (destroyedEnemy as AnimatedGameSprite).isBoss;
        if (isBoss) {
          this.addCoins(GAME_CONFIG.boss.coinsReward);
          this.onBossDefeated();
        } else if (this.started()) {
          // Track kills within the current stage; trigger boss when threshold is reached
          this.stageKills++;
          if (!this.enemy.bossFightActive && this.stageKills >= this.getKillsRequiredForStage(this.stage())) {
            this.enemy.bossFightActive = true;
            this.enemy.spawnStageBoss(this.stage());
          }
        }
        // Achievement: track cumulative kills and boss
        this.achievementService.addCumulative('first_kill', 1);
        this.achievementService.addCumulative('sharp_shooter', 1);
        this.achievementService.addCumulative('veteran', 1);
        // Daily challenge: track kills and boss
        this.dailyChallengeService.addKills(1);
        if (isBoss) {
          this.achievementService.checkMilestone('boss_hunter', 1);
          this.dailyChallengeService.addBoss();
        }
      }
    });

    this.object.onDestroyed(ObjectType.meteor, (meteor, by) => {
      if (!this.started() || !isShipDestroyer(by)) {
        return;
      }

      // Meteor split into fragments — coins will be awarded per fragment instead
      if (this.meteor.splitMeteors.has(meteor)) {
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

  get canContinue(): boolean {
    return this.savedStage() !== null;
  }

  getKillsRequiredForStage(stage: number): number {
    const normalizedStage = Math.max(1, Math.floor(stage));
    const scaledKills =
      STAGE_KILL_BASE +
      Math.floor((normalizedStage - 1) / STAGE_KILL_GROWTH_INTERVAL) * STAGE_KILL_GROWTH_AMOUNT;

    return Math.min(STAGE_KILL_CAP, scaledKills);
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

  private onBossDefeated(): void {
    const currentStage = this.stage();
    if (currentStage >= MAX_STAGE) {
      // Player has conquered all stages — victory!
      void this.storage.setHighscore(this.kills(), currentStage);
      void this.resetSavedStage();
      void this.presentPopup(VictoryPopup);
      this.ship.instance.autoFire = false;
      this.started.set(false);
      this.gameScreen.pauseButtonVisible = false;
    } else {
      // Advance to the next stage
      const nextStage = currentStage + 1;
      this.stage.set(nextStage);
      this.stageKills = 0;
      this.enemy.bossFightActive = false;
      void this.saveStageCheckpoint(nextStage);
      if (this.started()) {
        this.addBonusCoins(STAGE_BONUS_COINS);
        this.gameScreen.showStageAnnouncement(nextStage);
      }
    }
  }

  private addCoins(baseCoins: number): void {
    // multiply awarded coins by current combo then delegate to shared path
    const multiplier = Math.max(1, Math.floor(this.combo()));
    this.addBonusCoins(baseCoins * multiplier);
  }

  /** Awards coins that bypass the combo multiplier (flat bonuses like wave/streak rewards). */
  private addBonusCoins(amount: number): void {
    const clamped = Math.max(0, Math.floor(amount));
    if (clamped === 0) {
      return;
    }
    this.sessionCoins.update((value) => value + clamped);
    this.dailyChallengeService.addCoins(clamped);
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
    await this.playerShipService.init();
    await this.achievementService.init();
    await this.dailyChallengeService.init();
    const storedCoins = await this.storage.getCoins();
    const savedStage = await this.storage.getLevelCheckpoint();
    this.storedCoins.set(storedCoins);
    this.savedStage.set(savedStage);

    // Wire achievement unlock notification
    this.achievementService.onUnlocked = (def): void => {
      const titleKey = `achievement.${def.id}.title` as Parameters<typeof this.translation.getTranslation>[0];
      const title = this.translation.getTranslation(titleKey);
      const rewardLine = this.translation.getTranslation('achievement.reward', { reward: String(def.reward) });
      this.gameScreen.showAchievementBanner(def.icon, title, rewardLine);
      this.addBonusCoins(def.reward);
    };

    // Wire daily challenge completion notification
    this.dailyChallengeService.onCompleted = (challenge): void => {
      const title = this.translation.getTranslation('daily.completed');
      const rewardLine = this.translation.getTranslation('daily.reward', { reward: String(challenge.reward) });
      this.gameScreen.showAchievementBanner(challenge.icon, title, rewardLine);
      this.addBonusCoins(challenge.reward);
    };

    this.setup();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.started() && !this.#paused()) {
        void this.pause();
      }
    });

    await this.presentPopup(NavigationPopup);
  }

  async start(requester: AppScreen): Promise<void> {
    await this.startSession(requester, 1);
  }

  async continueFromCheckpoint(requester: AppScreen): Promise<void> {
    await this.startSession(requester, this.savedStage() ?? 1);
  }

  private async startSession(requester: AppScreen, startStage: number): Promise<void> {
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
    // Reset stage and streak tracking for the new game session
    this.stage.set(Math.min(MAX_STAGE, Math.max(1, Math.floor(startStage))));
    this.stageKills = 0;
    this.enemy.bossFightActive = false;
    this.lastShipEnergy = this.ship.instance.energy;
    this.streakElapsedMs = 0;
    this.nextStreakMilestoneMs = STREAK_INTERVAL_MS;
    await this.saveStageCheckpoint(this.stage());

    if (this.stage() > 1) {
      this.gameScreen.showStageAnnouncement(this.stage());
    }
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

  async openAchievements(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    await this.presentPopup(AchievementsPopup);
  }

  async openDailyChallenges(requester: AppScreen): Promise<void> {
    await this.hideAndRemoveScreen(requester);
    await this.presentPopup(DailyChallengesPopup);
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

      this.updatables.forEach((updatable) => updatable.update(delta, this.stage()));

      // Track damage for screen shake and survival streak
      const currentEnergy = this.ship.instance.energy;
      if (currentEnergy < this.lastShipEnergy) {
        // Player took damage: shake screen and reset streak
        this.streakElapsedMs = 0;
        this.nextStreakMilestoneMs = STREAK_INTERVAL_MS;
        this.gameScreen.applyScreenShake();
      } else if (currentEnergy > 0) {
        // Player is alive and unharmed this frame: accumulate streak time
        this.streakElapsedMs += delta.deltaMS;
        if (this.streakElapsedMs >= this.nextStreakMilestoneMs) {
          // Reset elapsed time so a tab-suspend or lag spike cannot award multiple bonuses
          this.streakElapsedMs = 0;
          this.nextStreakMilestoneMs = STREAK_INTERVAL_MS;
          this.addBonusCoins(STREAK_BONUS_COINS);
          this.gameScreen.showFloatingText(
            `🛡 +${STREAK_BONUS_COINS}`,
            this.ship.instance.x,
            this.ship.instance.y,
          );
        }
      }
      this.lastShipEnergy = currentEnergy;

      if (this.ship.instance.energy === 0) {
        void this.storage.setHighscore(this.kills(), this.stage());
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

  async handleShipClassPurchase(cls: PlayerShipClass): Promise<boolean> {
    const definition = this.playerShipService.getDefinition(cls);

    if (this.playerShipService.isUnlocked(cls)) {
      await this.playerShipService.selectClass(cls);
      this.ship.applyUpgrades();
      return true;
    }

    if (this.coins() < definition.cost) {
      return false;
    }

    this.applyCoinCost(definition.cost);
    await this.playerShipService.unlock(cls);
    await this.playerShipService.selectClass(cls);
    this.ship.applyUpgrades();

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

  private async saveStageCheckpoint(stage: number): Promise<void> {
    const normalizedStage = Math.min(MAX_STAGE, Math.max(1, Math.floor(stage)));
    this.savedStage.set(normalizedStage);
    await this.storage.setLevelCheckpoint(normalizedStage);
  }

  private async resetSavedStage(): Promise<void> {
    this.savedStage.set(null);
    await this.storage.clearLevelCheckpoint();
  }
}
