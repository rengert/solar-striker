import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  readonly context = new AudioContext();

  constructor() {
  }

  async playSound(): Promise<void> {
    const delay = 15;
    const types: OscillatorType[] = ['sine', 'sawtooth', 'square', 'triangle'];
    const data1 = 'Lorem ipsum';
    const data2 = 'Duis autem';

    const promises = [data1, data2].map(
      (data, index) => new Promise<void>(async(resolve) => {
        setTimeout(() => {
          this.playStringsAsSound(data.split(' '), types[index], index);
          resolve();
        }, index * delay);
      }),
    );

    await Promise.all(promises);
  }

  async playStringsAsSound(data: string [], type: OscillatorType, index: number): Promise<void> {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.connect(gain);
    gain.connect(this.context.destination);

    oscillator.start();

    for (const term of data) {
      gain.gain.exponentialRampToValueAtTime(0.025, this.context.currentTime);
      let frequency = 0;
      for (let i = 0; i < term.length; i++) {
        frequency += Math.round(0.75 * term.charCodeAt(i));
      }
      console.log(index, term, frequency);
      try {
        oscillator.frequency.value = frequency;
        gain.gain.exponentialRampToValueAtTime(0.00001, this.context.currentTime + 0.1);
      } catch (e) {
        console.log(e);
      }

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 160);
      });
    }
  }
}
