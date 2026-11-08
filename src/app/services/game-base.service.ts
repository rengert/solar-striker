import { inject, Injectable, signal } from '@angular/core';
import { Container, Graphics, Text } from 'pixi.js';
import { fontAwesomeStyle, icons } from '../style-constants';
import { ApplicationService } from './application.service';
import { ExplosionService } from './explosion.service';

export const BASE_MAX_ENERGY = 10;
// how far the planet surface bulges up at the screen center
const SURFACE_RISE = 18;
const SURFACE_COLOR = 0x1c2c4a;
const SHIELD_COLOR = 0x66ccff;
const SHIELD_HIT_COLOR = 0xff3333;
const SHIELD_WIDTH = 2;
const SHIELD_ALPHA = 0.8;
const SHIELD_HIT_MS = 250;
const BAR_SEGMENT_WIDTH = 7;
const BAR_SEGMENT_GAP = 2;
const BAR_HEIGHT = 4;
const BAR_BOTTOM_MARGIN = 6;
const BAR_ICON_GAP = 6;
const BAR_EMPTY_COLOR = 0x333344;
const BAR_LOW_COLOR = 0xff4444;
const BAR_LOW_THRESHOLD = 3;
const STRIKE_EXPLOSION_SCALE = 0.7;
const HALF = 0.5;
const QUARTER_CURVE = 4;
const CONTROL_POINT_FACTOR = 2;

/** The home planet at the bottom of the screen; every enemy ship that gets past the player strikes it once. */
@Injectable()
export class GameBaseService {
  readonly energy = signal(BASE_MAX_ENERGY);
  /** Energy after a repair; lowered by the weekly fragile base rule. */
  maxEnergy = BASE_MAX_ENERGY;

  private readonly application = inject(ApplicationService);
  private readonly explosion = inject(ExplosionService);
  private readonly container = new Container();
  private readonly surface = new Graphics();
  private readonly bar = new Graphics();
  private readonly icon = new Text({ text: icons.base, style: fontAwesomeStyle });
  private shieldHitUntil = 0;

  init(): void {
    this.container.eventMode = 'none';
    this.container.addChild(this.surface, this.bar, this.icon);
    this.application.stage.addChild(this.container);
    this.draw();
    this.application.renderer.on('resize', () => this.draw());
  }

  repair(): void {
    this.energy.set(this.maxEnergy);
    this.draw();
  }

  /** One strike from an enemy ship that flew past at screen position x. */
  attack(x: number): void {
    if (this.energy() === 0) {
      return;
    }
    this.energy.update((value) => value - 1);
    void this.explosion.explode(x, this.getSurfaceY(x), STRIKE_EXPLOSION_SCALE);
    this.shieldHitUntil = performance.now() + SHIELD_HIT_MS;
    this.draw();
    setTimeout(() => this.draw(), SHIELD_HIT_MS);
  }

  /** Height of the planet surface at x: a parabola from both bottom corners up to SURFACE_RISE in the middle. */
  getSurfaceY(x: number): number {
    const { width, height } = this.application.screen;
    const t = Math.min(Math.max(x / width, 0), 1);
    return height - QUARTER_CURVE * SURFACE_RISE * t * (1 - t);
  }

  private draw(): void {
    const { width, height } = this.application.screen;
    const hit = performance.now() < this.shieldHitUntil;

    // a quadratic curve with its control point at 2x rise peaks at exactly SURFACE_RISE
    this.surface
      .clear()
      .moveTo(0, height)
      .quadraticCurveTo(width * HALF, height - SURFACE_RISE * CONTROL_POINT_FACTOR, width, height)
      .closePath()
      .fill(SURFACE_COLOR)
      .moveTo(0, height)
      .quadraticCurveTo(width * HALF, height - SURFACE_RISE * CONTROL_POINT_FACTOR, width, height)
      .stroke({ color: hit ? SHIELD_HIT_COLOR : SHIELD_COLOR, width: SHIELD_WIDTH, alpha: SHIELD_ALPHA });

    const energy = this.energy();
    const barWidth = this.maxEnergy * (BAR_SEGMENT_WIDTH + BAR_SEGMENT_GAP) - BAR_SEGMENT_GAP;
    const left = (width - barWidth) * HALF;
    const top = height - BAR_BOTTOM_MARGIN - BAR_HEIGHT;
    const color = energy <= BAR_LOW_THRESHOLD ? BAR_LOW_COLOR : SHIELD_COLOR;
    this.bar.clear();
    for (let i = 0; i < this.maxEnergy; i++) {
      this.bar
        .rect(left + i * (BAR_SEGMENT_WIDTH + BAR_SEGMENT_GAP), top, BAR_SEGMENT_WIDTH, BAR_HEIGHT)
        .fill(i < energy ? color : BAR_EMPTY_COLOR);
    }
    this.icon.tint = color;
    this.icon.x = left - this.icon.width - BAR_ICON_GAP;
    this.icon.y = top + (BAR_HEIGHT - this.icon.height) * HALF;
  }
}
