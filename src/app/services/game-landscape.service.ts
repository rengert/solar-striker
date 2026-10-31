import { inject, Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { Container, Sprite, Texture, Ticker } from 'pixi.js';
import { BackgroundSprite } from '../models/pixijs/background-sprite';
import { CURRENT_SEASON_EVENT } from '../models/season-event.model';
import {
  createAsteroidTexture,
  createDustTexture,
  createNebulaTexture,
  createPlanetTexture,
  createStarfieldTexture,
  createVignetteTexture,
} from '../utils/texture.util';
import { ParticleService } from './particle.service';
import { UpdatableService } from './updatable.service';

const THEME_COUNT = 4;
const THEME_FADE_S = 1.5;
const AMBIENCE_INTERVAL_MS = { fall: 120, rise: 160, burst: 1400 } as const;

@Injectable()
export class GameLandscapeService extends UpdatableService {
  private readonly landscapes: BackgroundSprite[] = [];
  private readonly particles = inject(ParticleService);
  /** desert, nebula, asteroid field, planet; one per stage, cycling */
  private readonly themes: Container[] = [];
  private themeIndex = 0;
  private ambienceMs = 0;

  setup(): void {
    if (this.landscapes.length) {
      throw new Error('do not call setup twice');
    }

    this.themes.push(this.addTheme());
    this.setupBackground();
    this.setupClouds();
    this.setupNebula();
    this.setupAsteroids();
    this.setupPlanet();
    this.themes.forEach((theme, index) => {
      theme.alpha = index === this.themeIndex ? 1 : 0;
      theme.visible = index === this.themeIndex;
    });
    this.setupDust();
    this.application.stage.addChild(this.particles.layer);
  }

  /** Cross-fades to the background of the given stage. */
  setStage(stage: number): void {
    const next = (Math.max(1, stage) - 1) % THEME_COUNT;
    if (next === this.themeIndex) {
      return;
    }
    const previous = this.themes[this.themeIndex] as Container | undefined;
    this.themeIndex = next;
    const current = this.themes[next] as Container | undefined;
    if (!previous || !current) {
      // not set up yet; setup() shows the stored theme
      return;
    }
    gsap.killTweensOf([previous, current]);
    // put the new theme directly below the old one, then fade the old one away
    const root = this.application.stage;
    root.removeChild(current);
    root.addChildAt(current, root.getChildIndex(previous));
    current.alpha = 1;
    current.visible = true;
    void gsap.to(previous, {
      alpha: 0,
      duration: THEME_FADE_S,
      onComplete: () => {
        previous.visible = false;
      },
    });
  }

  update(ticker: Ticker): void {
    this.landscapes.forEach((item) => item.update(ticker));
    this.updateAmbience(ticker.deltaMS);
  }

  private setupBackground(): void {
    const background = new BackgroundSprite(Texture.from('background'), {
      speedTilePositionY: 0.025,
      speedTilePositionX: 0,
      width: this.application.screen.width,
      height: this.application.screen.height,
    });
    this.landscapes.push(background);
    this.themes[0].addChild(background);
  }

  private setupClouds(): void {
    const cloud = new BackgroundSprite(Texture.from('clouds'), {
      speedTilePositionY: 0,
      speedTilePositionX: 0.025,
      width: this.application.screen.width,
      height: 103,
      speedY: 0.075,
      maxY: this.application.screen.height,
    });
    // eslint-disable-next-line no-magic-numbers
    cloud.y = Math.floor(this.application.screen.height / 2);
    this.landscapes.push(cloud);
    this.themes[0].addChild(cloud);

    const cloud2 = new BackgroundSprite(Texture.from('assets/game/clouds-transparent.png'), {
      speedTilePositionY: 0,
      speedTilePositionX: 0.013,
      width: this.application.screen.width,
      height: 103,
      speedY: 0.085,
      maxY: this.application.screen.height,
    });
    // eslint-disable-next-line no-magic-numbers
    cloud2.y = Math.floor(this.application.screen.height / 4);
    this.landscapes.push(cloud2);
    this.themes[0].addChild(cloud2);
  }

  private addTheme(): Container {
    const theme = new Container();
    this.application.stage.addChild(theme);
    return theme;
  }

  /* eslint-disable no-magic-numbers */
  private addLayer(theme: Container, texture: Texture, speedY: number, speedX = 0): BackgroundSprite {
    const { width, height } = this.application.screen;
    const layer = new BackgroundSprite(texture, { speedTilePositionY: speedY, speedTilePositionX: speedX, width, height });
    this.landscapes.push(layer);
    theme.addChild(layer);
    return layer;
  }

  private setupNebula(): void {
    const theme = this.addTheme();
    this.addLayer(theme, createStarfieldTexture(), 0.01);
    // gas stays dim so enemies and shots remain readable on top
    for (const [speedY, speedX] of [[0.02, 0.003], [0.035, 0]]) {
      const gas = this.addLayer(theme, createNebulaTexture(), speedY, speedX);
      gas.blendMode = 'add';
      gas.alpha = 0.6;
    }
    this.themes.push(theme);
  }

  private setupAsteroids(): void {
    const theme = this.addTheme();
    this.addLayer(theme, createStarfieldTexture(), 0.012);
    this.addLayer(theme, createAsteroidTexture(256, 10), 0.03).alpha = 0.5;
    this.addLayer(theme, createAsteroidTexture(512, 7), 0.07, 0.004);
    this.themes.push(theme);
  }

  private setupPlanet(): void {
    const theme = this.addTheme();
    const { width, height } = this.application.screen;
    this.addLayer(theme, createStarfieldTexture(), 0.008);
    const diameter = Math.max(width, height) * 0.9;
    const planet = new Sprite(createPlanetTexture(diameter));
    planet.anchor.set(0.5);
    // only the upper part peeks in as a horizon at the bottom of the screen
    planet.position.set(width * 0.6, height + diameter * 0.25);
    theme.addChild(planet);
    this.themes.push(theme);
  }

  private setupDust(): void {
    const { width, height } = this.application.screen;
    // two drifting speck layers at different speeds give the desert some parallax depth
    const layers = [
      { count: 40, radius: 1, speed: 0.06, alpha: 0.35 },
      { count: 14, radius: 2, speed: 0.14, alpha: 0.5 },
    ];
    for (const layer of layers) {
      const dust = new BackgroundSprite(createDustTexture(layer.count, layer.radius), {
        speedTilePositionY: layer.speed,
        speedTilePositionX: layer.speed / 6,
        width,
        height,
      });
      dust.alpha = layer.alpha;
      dust.blendMode = 'add';
      this.landscapes.push(dust);
      this.application.stage.addChild(dust);
    }

    if (CURRENT_SEASON_EVENT) {
      const wash = new Sprite(Texture.WHITE);
      wash.setSize(width, height);
      wash.tint = CURRENT_SEASON_EVENT.backgroundTint;
      wash.alpha = CURRENT_SEASON_EVENT.backgroundAlpha;
      this.application.stage.addChild(wash);
    }

    const vignette = new Sprite(createVignetteTexture(width, height));
    this.application.stage.addChild(vignette);
  }

  /** Seasonal snow/petals, rising embers or fireworks on top of the background. */
  private updateAmbience(deltaMs: number): void {
    if (!CURRENT_SEASON_EVENT) {
      return;
    }
    const { ambience, colors } = CURRENT_SEASON_EVENT;
    this.ambienceMs += deltaMs;
    if (this.ambienceMs < AMBIENCE_INTERVAL_MS[ambience]) {
      return;
    }
    this.ambienceMs = 0;
    const { width, height } = this.application.screen;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * width;
    if (ambience === 'burst') {
      const y = height * (0.1 + Math.random() * 0.4);
      this.particles.emit({ x, y, color, ring: true, life: 900, scale: 0.2, endScale: 2.5, alpha: 0.5 });
      this.particles.emit({
        x, y, color, count: 32, speed: 0.22, life: 1800, scale: 0.45, endScale: 0.05, drag: 0.97, alpha: 0.8,
      });
      return;
    }
    const falling = ambience === 'fall';
    this.particles.emit({
      x,
      y: falling ? -10 : height + 10,
      color,
      speed: 0.06,
      angle: falling ? Math.PI / 2 : -Math.PI / 2,
      spread: 0.6,
      life: height / 0.04,
      scale: 0.3 + Math.random() * 0.3,
      endScale: 0.2,
      alpha: 0.8,
    });
  }
  /* eslint-enable no-magic-numbers */
}
