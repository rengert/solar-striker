/* eslint-disable no-magic-numbers */
import { Injectable } from '@angular/core';

export type SoundEffect =
  | 'laser'
  | 'explosion'
  | 'bigExplosion'
  | 'hit'
  | 'powerUp'
  | 'click'
  | 'bossWarning'
  | 'stageClear'
  | 'gameOver'
  | 'victory';

export type MusicTrack = 'menu' | 'campaign' | 'endless' | 'boss';

const MUTED_STORAGE_KEY = 'sound-muted';
const MUSIC_MUTED_STORAGE_KEY = 'music-muted';
const SFX_VOLUME = 0.5;
const MUSIC_VOLUME = 0.18;
const LOOKAHEAD_S = 0.2;
const SCHEDULER_INTERVAL_MS = 50;

interface Track {
  bpm: number;
  /** bass root frequency per chord */
  bass: number[];
  /** eighth notes per chord */
  stepsPerChord: number;
  bassWave: OscillatorType;
  /** lead offsets in semitones above the bass root, one per eighth */
  lead: number[];
  leadWave: OscillatorType;
  leadCutoff: number;
  /** a kick every n eighths */
  kickEvery: number;
  /** a hi-hat every n eighths, 0 for none */
  hatEvery: number;
}

const TRACKS: Record<MusicTrack, Track> = {
  // calm hangar ambience: Am – F – C – G, half-time kick, soft triangle arpeggio
  menu: {
    bpm: 84,
    bass: [110, 87.31, 130.81, 98],
    stepsPerChord: 16,
    bassWave: 'triangle',
    lead: [12, 19, 24, 31, 27, 24, 19, 15],
    leadWave: 'triangle',
    leadCutoff: 1800,
    kickEvery: 8,
    hatEvery: 0,
  },
  // the original synthwave loop
  campaign: {
    bpm: 112,
    bass: [110, 87.31, 130.81, 98],
    stepsPerChord: 16,
    bassWave: 'sawtooth',
    lead: [12, 19, 24, 19, 15, 19, 24, 27],
    leadWave: 'square',
    leadCutoff: 2400,
    kickEvery: 2,
    hatEvery: 0,
  },
  // faster drive for endless runs: Em – C – D – Bm with off-beat hats
  endless: {
    bpm: 128,
    bass: [82.41, 65.41, 73.42, 61.74],
    stepsPerChord: 16,
    bassWave: 'sawtooth',
    lead: [24, 19, 15, 19, 27, 24, 19, 12],
    leadWave: 'sawtooth',
    leadCutoff: 2000,
    kickEvery: 2,
    hatEvery: 2,
  },
  // tense boss loop: A – A – Bb – G# with a diminished arpeggio and running hats
  boss: {
    bpm: 140,
    bass: [110, 110, 116.54, 103.83],
    stepsPerChord: 8,
    bassWave: 'sawtooth',
    lead: [12, 15, 18, 15, 24, 18, 15, 13],
    leadWave: 'square',
    leadCutoff: 3200,
    kickEvery: 2,
    hatEvery: 1,
  },
};

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
  private track: MusicTrack = 'campaign';
  private mutedState = readFlag(MUTED_STORAGE_KEY);
  private musicMutedState = readFlag(MUSIC_MUTED_STORAGE_KEY);

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
    writeFlag(MUTED_STORAGE_KEY, value);
    if (this.context) {
      void (value ? this.context.suspend() : this.context.resume());
    }
  }

  /** Music off keeps the effects; `muted` silences everything. */
  get musicMuted(): boolean {
    return this.musicMutedState;
  }

  set musicMuted(value: boolean) {
    this.musicMutedState = value;
    writeFlag(MUSIC_MUTED_STORAGE_KEY, value);
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
        this.playMelody(t, 'triangle', [523.25, 659.25, 783.99, 1046.5], 0.06, 0.12, 0.25);
        break;
      case 'click':
        this.playTone(t, 'triangle', 880, 660, 0.05, 0.15);
        break;
      case 'bossWarning':
        // two-tone siren, three times
        for (let i = 0; i < 6; i++) {
          this.playTone(t + i * 0.22, 'sawtooth', i % 2 ? 440 : 587.33, null, 0.2, 0.18, this.sfx, 1600);
        }
        break;
      case 'stageClear':
        this.playMelody(t, 'square', [392, 523.25, 659.25, 783.99, 1046.5], 0.09, 0.2, 0.15);
        break;
      case 'gameOver':
        this.playMelody(t, 'triangle', [392, 349.23, 311.13, 233.08], 0.28, 0.5, 0.3);
        this.playTone(t + 1.12, 'sine', 116.54, 58.27, 1.2, 0.4);
        break;
      case 'victory':
        this.playMelody(t, 'square', [523.25, 523.25, 523.25, 698.46, 880, 1046.5], 0.14, 0.3, 0.15);
        this.playMelody(t, 'triangle', [261.63, 261.63, 261.63, 349.23, 440, 523.25], 0.14, 0.3, 0.25);
        break;
      default:
        break;
    }
  }

  /** Starts the given loop, or switches to it on the next eighth if another one is playing. */
  startMusic(track: MusicTrack = 'campaign'): void {
    const ctx = this.getContext();
    if (!ctx) {
      return;
    }
    if (track !== this.track) {
      this.track = track;
      this.step = 0;
    }
    if (this.musicTimer !== undefined) {
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
    const track = TRACKS[this.track];
    const stepS = 60 / track.bpm / 2; // eighth notes
    while (this.nextStepTime < ctx.currentTime + LOOKAHEAD_S) {
      const t = this.nextStepTime;
      // keep the clock running while music is off so it comes back in time
      if (!this.musicMutedState) {
        const root = track.bass[Math.floor(this.step / track.stepsPerChord) % track.bass.length];
        // pumping octave bass
        this.playTone(t, track.bassWave, this.step % 2 ? root * 2 : root, null, stepS * 0.9, 0.5, this.music, 900);
        const lead = root * 2 ** (track.lead[this.step % track.lead.length] / 12);
        this.playTone(t, track.leadWave, lead, null, stepS * 0.6, 0.15, this.music, track.leadCutoff);
        if (this.step % track.kickEvery === 0) {
          this.playTone(t, 'sine', 150, 40, 0.18, 0.9, this.music);
        }
        // off-beat hats when every other eighth, otherwise on every hat step
        if (track.hatEvery && (this.step + (track.hatEvery > 1 ? 1 : 0)) % track.hatEvery === 0) {
          this.playNoise(t, 9000, 0.04, 0.25, this.music);
        }
      }
      this.nextStepTime += stepS;
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

  // eslint-disable-next-line max-params
  private playMelody(t: number, type: OscillatorType, notes: number[], gap: number, duration: number, volume: number): void {
    notes.forEach((freq, i) => this.playTone(t + i * gap, type, freq, null, duration, volume));
  }

  /** Filtered white noise with a falling cutoff, the body of every explosion and the music's hi-hat. */
  // eslint-disable-next-line max-params
  private playNoise(t: number, cutoff: number, duration: number, volume: number, out = this.sfx): void {
    const ctx = this.context!;
    const source = ctx.createBufferSource();
    source.buffer = this.noise!;
    const filter = ctx.createBiquadFilter();
    filter.frequency.setValueAtTime(cutoff, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + duration);
    source.connect(filter).connect(this.createEnvelope(t, duration, volume)).connect(out!);
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

function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // ignore storage errors
  }
}
