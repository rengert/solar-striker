/* eslint-disable no-magic-numbers */
import { Injectable } from '@angular/core';

export type SoundEffect = 'laser' | 'explosion' | 'bigExplosion' | 'hit' | 'powerUp';

const MUTED_STORAGE_KEY = 'sound-muted';
const SFX_VOLUME = 0.5;
const MUSIC_VOLUME = 0.18;
const BPM = 112;
const STEP_S = 60 / BPM / 2; // eighth notes
const LOOKAHEAD_S = 0.2;
const SCHEDULER_INTERVAL_MS = 50;
// Am – F – C – G, two bars each, as bass root frequencies
const BASS_LINE = [110, 87.31, 130.81, 98];
const STEPS_PER_CHORD = 16;
// minor-pentatonic arpeggio offsets in semitones above the bass root, one per eighth
const ARPEGGIO = [12, 19, 24, 19, 15, 19, 24, 27];

/** Synthesised sound effects and a small synthwave loop via Web Audio; no audio files needed. */
@Injectable({ providedIn: 'root' })
export class SoundService {
  private context: AudioContext | undefined;
  private sfx: GainNode | undefined;
  private music: GainNode | undefined;
  private noise: AudioBuffer | undefined;
  private musicTimer: number | undefined;
  private nextStepTime = 0;
  private step = 0;
  private mutedState = readMuted();

  constructor() {
    // browsers (iOS Safari strictly) only let audio start inside a user gesture handler, but music and effects
    // start from the game loop, so unlock the context on every gesture; a no-op once it is running
    for (const type of ['pointerup', 'touchend', 'click', 'keydown']) {
      window.addEventListener(type, () => this.getContext(), { capture: true, passive: true });
    }
    // iOS mutes Web Audio while the ringer switch is on silent unless the session is declared as playback
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) {
      session.type = 'playback';
    }
  }

  get muted(): boolean {
    return this.mutedState;
  }

  set muted(value: boolean) {
    this.mutedState = value;
    try {
      window.localStorage.setItem(MUTED_STORAGE_KEY, String(value));
    } catch {
      // ignore storage errors
    }
    if (this.context) {
      void (value ? this.context.suspend() : this.context.resume());
    }
  }

  play(effect: SoundEffect): void {
    const ctx = this.getContext();
    if (!ctx || this.mutedState) {
      return;
    }
    const t = ctx.currentTime;
    switch (effect) {
      case 'laser':
        this.playTone(t, 'square', 1400, 280, 0.09, 0.06);
        break;
      case 'explosion':
        this.playNoise(t, 1800, 0.45, 0.5);
        break;
      case 'bigExplosion':
        this.playNoise(t, 1200, 1.1, 0.9);
        this.playTone(t, 'sine', 120, 30, 0.6, 0.6);
        break;
      case 'hit':
        this.playTone(t, 'sawtooth', 220, 55, 0.25, 0.3);
        this.playNoise(t, 3000, 0.15, 0.3);
        break;
      case 'powerUp':
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => this.playTone(t + i * 0.06, 'triangle', freq, freq, 0.12, 0.25));
        break;
      default:
        break;
    }
  }

  startMusic(): void {
    const ctx = this.getContext();
    if (!ctx || this.musicTimer !== undefined) {
      return;
    }
    this.nextStepTime = ctx.currentTime + 0.05;
    this.musicTimer = window.setInterval(() => this.scheduleMusic(ctx), SCHEDULER_INTERVAL_MS);
  }

  stopMusic(): void {
    window.clearInterval(this.musicTimer);
    this.musicTimer = undefined;
  }

  private scheduleMusic(ctx: AudioContext): void {
    while (this.nextStepTime < ctx.currentTime + LOOKAHEAD_S) {
      const t = this.nextStepTime;
      const root = BASS_LINE[Math.floor(this.step / STEPS_PER_CHORD) % BASS_LINE.length];
      // pumping octave bass
      this.playTone(t, 'sawtooth', this.step % 2 ? root * 2 : root, null, STEP_S * 0.9, 0.5, this.music, 900);
      this.playTone(t, 'square', root * 2 ** (ARPEGGIO[this.step % ARPEGGIO.length] / 12), null, STEP_S * 0.6, 0.15, this.music, 2400);
      if (this.step % 2 === 0) {
        // kick on every beat
        this.playTone(t, 'sine', 150, 40, 0.18, 0.9, this.music);
      }
      this.nextStepTime += STEP_S;
      this.step++;
    }
  }

  // eslint-disable-next-line max-params
  private playTone(
    t: number,
    type: OscillatorType,
    from: number,
    to: number | null,
    duration: number,
    volume: number,
    out = this.sfx,
    lowpass?: number,
  ): void {
    const ctx = this.context!;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to !== null) {
      osc.frequency.exponentialRampToValueAtTime(to, t + duration);
    }
    const gain = this.createEnvelope(t, duration, volume);
    if (lowpass) {
      const filter = ctx.createBiquadFilter();
      filter.frequency.value = lowpass;
      osc.connect(filter).connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(out!);
    osc.start(t);
    osc.stop(t + duration);
  }

  /** Filtered white noise with a falling cutoff, the body of every explosion. */
  private playNoise(t: number, cutoff: number, duration: number, volume: number): void {
    const ctx = this.context!;
    const source = ctx.createBufferSource();
    source.buffer = this.noise!;
    const filter = ctx.createBiquadFilter();
    filter.frequency.setValueAtTime(cutoff, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + duration);
    source.connect(filter).connect(this.createEnvelope(t, duration, volume)).connect(this.sfx!);
    source.start(t);
    source.stop(t + duration);
  }

  private createEnvelope(t: number, duration: number, volume: number): GainNode {
    const gain = this.context!.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    return gain;
  }

  private getContext(): AudioContext | undefined {
    if (!this.context) {
      try {
        this.context = new AudioContext();
      } catch {
        return undefined;
      }
      this.sfx = this.context.createGain();
      this.sfx.gain.value = SFX_VOLUME;
      this.sfx.connect(this.context.destination);
      this.music = this.context.createGain();
      this.music.gain.value = MUSIC_VOLUME;
      this.music.connect(this.context.destination);
      this.noise = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      if (this.mutedState) {
        void this.context.suspend();
      }
    }
    // browsers start the context suspended until the first user gesture
    // 'interrupted' is iOS after a phone call or Siri
    if (this.context.state !== 'running' && this.context.state !== 'closed' && !this.mutedState) {
      void this.context.resume();
    }
    return this.context;
  }
}

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}
