/* eslint-disable no-magic-numbers */
import { inject, Injectable } from '@angular/core';
import { Container, Sprite, Texture, Ticker } from 'pixi.js';
import { createGlowTexture, createRingTexture } from '../utils/texture.util';
import { ApplicationService } from './application.service';

const MAX_PARTICLES = 700;
const FRAME_MS = 1000 / 60;

export interface ParticleOptions {
  x: number;
  y: number;
  color: number;
  count?: number;
  /** px per ms */
  speed?: number;
  /** direction in rad; default is a full circle */
  angle?: number;
  spread?: number;
  life?: number;
  scale?: number;
  endScale?: number;
  alpha?: number;
  /** velocity multiplier per 60fps frame */
  drag?: number;
  additive?: boolean;
  ring?: boolean;
}

interface Particle {
  sprite: Sprite;
  vx: number;
  vy: number;
  age: number;
  life: number;
  scale: number;
  endScale: number;
  alpha: number;
  drag: number;
}

@Injectable()
export class ParticleService {
  readonly layer = new Container();

  private readonly application = inject(ApplicationService);
  private readonly particles: Particle[] = [];
  // finished particles keep their record and their sprite (hidden in the layer), so emitting allocates nothing
  private readonly pool: Particle[] = [];
  private glow: Texture | undefined;
  private ring: Texture | undefined;
  private ticking = false;

  emit(options: ParticleOptions): void {
    if (!this.ticking) {
      this.ticking = true;
      this.glow = createGlowTexture();
      this.ring = createRingTexture();
      this.application.ticker.add(this.tick, this);
    }

    const count = Math.min(options.count ?? 1, MAX_PARTICLES - this.particles.length);
    for (let i = 0; i < count; i++) {
      const particle = this.pool.pop() ?? this.createParticle();
      const sprite = particle.sprite;
      sprite.texture = (options.ring ? this.ring : this.glow)!;
      sprite.visible = true;
      sprite.alpha = options.alpha ?? 1;
      sprite.position.set(options.x, options.y);
      sprite.tint = options.color;
      sprite.blendMode = options.additive === false ? 'normal' : 'add';
      const angle = options.angle === undefined
        ? Math.random() * Math.PI * 2
        : options.angle + (Math.random() - 0.5) * (options.spread ?? 0);
      const speed = (options.speed ?? 0) * (0.4 + Math.random() * 0.6);
      const scale = options.scale ?? 0.5;
      sprite.scale.set(scale);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.age = 0;
      particle.life = (options.life ?? 400) * (0.7 + Math.random() * 0.3);
      particle.scale = scale;
      particle.endScale = options.endScale ?? scale;
      particle.alpha = options.alpha ?? 1;
      particle.drag = options.drag ?? 1;
      this.particles.push(particle);
    }
  }

  private tick(ticker: Ticker): void {
    const dt = ticker.deltaMS;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.age += dt;
      if (particle.age >= particle.life) {
        particle.sprite.visible = false;
        this.pool.push(particle);
        this.particles[i] = this.particles[this.particles.length - 1];
        this.particles.pop();
        continue;
      }
      const t = particle.age / particle.life;
      const drag = Math.pow(particle.drag, dt / FRAME_MS);
      particle.vx *= drag;
      particle.vy *= drag;
      particle.sprite.x += particle.vx * dt;
      particle.sprite.y += particle.vy * dt;
      particle.sprite.alpha = particle.alpha * (1 - t);
      particle.sprite.scale.set(particle.scale + (particle.endScale - particle.scale) * t);
    }
  }

  private createParticle(): Particle {
    const sprite = new Sprite();
    sprite.anchor.set(0.5);
    this.layer.addChild(sprite);
    return { sprite, vx: 0, vy: 0, age: 0, life: 0, scale: 0, endScale: 0, alpha: 0, drag: 1 };
  }
}
