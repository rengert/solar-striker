import { inject, Injectable } from '@angular/core';
import { Assets, Graphics, Spritesheet, Text, TextStyle, Texture } from 'pixi.js';
import { gsap } from 'gsap';
import { GAME_CONFIG, MAX_SHOT_POWER, OFF_SCREEN_BUFFER, THE_MIDDLE } from '../game-constants';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { PowerUpSprite } from '../models/pixijs/power-up-sprite';
import { Ship } from '../models/pixijs/ship';
import { ObjectModelType, ObjectService } from './object.service';
import { UpdatableService } from './updatable.service';
import { AchievementService } from './achievement.service';
import { GameShotService } from './game-shot.service';

interface Dictionary<T> {
  [key: string]: T;
}

const NUKE_FLASH_ALPHA = 0.9;
const NUKE_FLASH_DURATION_S = 0.5;
const NUKE_FONT_SIZE = 48;
const NUKE_STROKE_WIDTH = 6;
const NUKE_TEXT_DISPLAY_MS = 1500;
const NUKE_TEXT_FADE_S = 0.4;
const NUKE_FLASH_COLOR = 0xffffff;
const NUKE_TEXT_COLOR = 0xff6600;
const CENTER_DIVISOR = 2;
const ORBITAL_STRIKE_FONT_SIZE = 40;
const ORBITAL_STRIKE_STROKE_WIDTH = 5;
const ORBITAL_STRIKE_FLASH_COLOR = 0x00ffff;
const ORBITAL_STRIKE_TEXT_COLOR = 0x0088ff;

@Injectable()
export class GameCollectableService extends UpdatableService {
  private readonly object = inject(ObjectService);
  private readonly achievementService = inject(AchievementService);
  private readonly shotService = inject(GameShotService);

  private readonly animations: Dictionary<Texture[]> = {};

  constructor() {
    super();

    this.object.onDestroyed(ObjectType.enemy, (enemy, by) => this.spawn(enemy, by));
    this.object.onDestroyed(ObjectType.collectable, (powerUp, by) => this.collectPowerUp(powerUp, by));
  }

  async init(): Promise<void> {
    if (Object.values(this.animations).length === 0) {
      for (const config of GAME_CONFIG.powerUpConfig) {
        const powerUp = await Assets.load<Spritesheet>(config.assetUrl);
        const animations: Record<string, Texture[]> = powerUp.animations;
        this.animations[config.type] = animations[config.animationName];
      }
    }
  }

  update(): void {
    this.object
      .collectables()
      .filter((collectable) => collectable.y > this.application.screen.height + OFF_SCREEN_BUFFER)
      .forEach((collectable) => collectable.destroy());
  }

  private collectPowerUp(object: ObjectModelType, by: ObjectModelType): void {
    if (by.type !== ObjectType.ship) {
      return;
    }
    const ship = by as unknown as Ship;
    const powerUp = object as unknown as PowerUpSprite;
    ship.shotSpeed += powerUp.config.powerUp.speed;
    ship.shotPower = Math.min(ship.shotPower + powerUp.config.powerUp.shot, MAX_SHOT_POWER);
    ship.energy += powerUp.config.powerUp.energy;
    ship.shieldTicks += powerUp.config.powerUp.shield ?? 0;

    if (powerUp.config.powerUp.nuke === true) {
      this.applyNuke(by);
      this.achievementService.checkMilestone('nuke_deployed', 1);
    }

    if (powerUp.config.powerUp.orbitalStrike === true) {
      this.applyOrbitalStrike(ship);
    }
  }

  private applyNuke(ship: ObjectModelType): void {
    [...this.object.enemies(), ...this.object.meteors()]
      .filter((target) => !target.destroying && !target.destroyed)
      .forEach((target) => {
        target.explode();
        this.object.triggerCallbacks(target, ship);
      });

    const flash = new Graphics();
    flash.fill(NUKE_FLASH_COLOR);
    flash.rect(0, 0, this.application.screen.width, this.application.screen.height);
    flash.fill();
    flash.alpha = NUKE_FLASH_ALPHA;
    this.application.stage.addChild(flash);
    void gsap.to(flash, {
      alpha: 0,
      duration: NUKE_FLASH_DURATION_S,
      onComplete: () => {
        flash.parent?.removeChild(flash);
        flash.destroy();
      },
    });

    const text = new Text({
      text: '☢ NUKE! ☢',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: NUKE_FONT_SIZE,
        fontWeight: 'bold',
        fill: NUKE_TEXT_COLOR,
        stroke: {
          color: NUKE_FLASH_COLOR,
          width: NUKE_STROKE_WIDTH,
        },
        align: 'center',
      }),
    });
    text.anchor.set(THE_MIDDLE);
    text.x = this.application.screen.width / CENTER_DIVISOR;
    text.y = this.application.screen.height / CENTER_DIVISOR;
    this.application.stage.addChild(text);

    setTimeout(() => {
      void gsap.to(text, {
        alpha: 0,
        duration: NUKE_TEXT_FADE_S,
        onComplete: () => {
          text.parent?.removeChild(text);
          text.destroy();
        },
      });
    }, NUKE_TEXT_DISPLAY_MS);
  }

  private applyOrbitalStrike(ship: Ship): void {
    this.shotService.fireOrbitalStrike(ship);

    const flash = new Graphics();
    // eslint-disable-next-line no-magic-numbers
    flash.fill(ORBITAL_STRIKE_FLASH_COLOR);
    flash.rect(0, 0, this.application.screen.width, this.application.screen.height);
    flash.fill();
    // eslint-disable-next-line no-magic-numbers
    flash.alpha = 0.4;
    this.application.stage.addChild(flash);
    void gsap.to(flash, {
      alpha: 0,
      duration: NUKE_FLASH_DURATION_S,
      onComplete: () => {
        flash.parent?.removeChild(flash);
        flash.destroy();
      },
    });

    const text = new Text({
      text: '🌀 ORBITAL STRIKE! 🌀',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: ORBITAL_STRIKE_FONT_SIZE,
        fontWeight: 'bold',
        fill: ORBITAL_STRIKE_TEXT_COLOR,
        stroke: {
          color: ORBITAL_STRIKE_FLASH_COLOR,
          width: ORBITAL_STRIKE_STROKE_WIDTH,
        },
        align: 'center',
      }),
    });
    text.anchor.set(THE_MIDDLE);
    text.x = this.application.screen.width / CENTER_DIVISOR;
    text.y = this.application.screen.height / CENTER_DIVISOR;
    this.application.stage.addChild(text);

    setTimeout(() => {
      void gsap.to(text, {
        alpha: 0,
        duration: NUKE_TEXT_FADE_S,
        onComplete: () => {
          text.parent?.removeChild(text);
          text.destroy();
        },
      });
    }, NUKE_TEXT_DISPLAY_MS);
  }

  private spawn({ x, y }: ObjectModelType, { type, reference }: ObjectModelType): void {
    if (type !== ObjectType.ship && reference?.type !== ObjectType.ship) {
      return;
    }

    const rand = Math.random();
    if (rand > GAME_CONFIG.collectableFactor) {
      return;
    }

    const value = Math.floor(Math.random() * GAME_CONFIG.powerUpConfig.length);
    const powerUpType = GAME_CONFIG.powerUpConfig[value];
    const texture = this.animations[powerUpType.type];
    const powerUp = new PowerUpSprite(1, texture, powerUpType);
    powerUp.animationSpeed = 0.167;
    powerUp.play();
    // eslint-disable-next-line no-magic-numbers
    powerUp.anchor.set(0.5);
    powerUp.x = x;
    powerUp.y = y;
    powerUp.power = 0;
    if (powerUpType.tint !== undefined) {
      powerUp.tint = powerUpType.tint;
    }
    this.application.stage.addChild(powerUp);
    this.object.add(powerUp);
  }
}
